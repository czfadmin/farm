// using native ability to load resources if target env is node.

export interface Resource {
  path: string;
  type: 'script' | 'link';
}

// Injected during build
export const __farm_global_this__: any = eval('<@__farm_global_this__@>');

export const targetEnv = __farm_global_this__.__FARM_TARGET_ENV__ || 'node';
export const isBrowser =
  targetEnv === 'browser' && (globalThis || window).document;

/**
 * Loading resources according to their type and target env.
 */
export class ResourceLoader {
  private _loadedResources: Record<string, boolean> = {};
  private _loadingResources: Record<string, Promise<void>> = {};

  publicPaths: string[];

  constructor(publicPaths: string[]) {
    this.publicPaths = publicPaths;
  }

  load(resource: Resource, index = 0): Promise<void> {
    // it's not running in browser
    if (!isBrowser) {
      if (resource.type === 'script') {
        return this._loadScript(`./${resource.path}`);
      } else if (resource.type === 'link') {
        return this._loadLink(`./${resource.path}`);
      }
    }

    const publicPath = this.publicPaths[index];
    const url = `${
      publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath
    }/${resource.path}`;

    if (this._loadedResources[resource.path]) {
      return;
    } else if (this._loadingResources[resource.path]) {
      return this._loadingResources[resource.path];
    }

    let promise = Promise.resolve();

    if (resource.type === 'script') {
      promise = this._loadScript(url);
    } else if (resource.type === 'link') {
      promise = this._loadLink(url);
    }

    this._loadingResources[resource.path] = promise;

    promise
      .then(() => {
        this._loadedResources[resource.path] = true;
      })
      .catch((e) => {
        console.warn(
          `[Farm] Failed to load resource "${url}" using publicPath: ${this.publicPaths[index]}`
        );
        index++;

        if (index < this.publicPaths.length) {
          return this.load(resource, index);
        } else {
          throw new Error(
            `[Farm] Failed to load resource: "${resource.path}, type: ${resource.type}". ${e}`
          );
        }
      });
    return promise;
  }

  setLoadedResource(path: string) {
    this._loadedResources[path] = true;
  }

  private _loadScript(path: string): Promise<void> {
    if (!isBrowser) {
      return import(path);
    } else {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        document.body.appendChild(script);

        script.onload = () => {
          resolve();
        };
        script.onerror = (e) => {
          reject(e);
        };
      });
    }
  }

  private _loadLink(path: string): Promise<void> {
    if (!isBrowser) {
      // return Promise.reject(new Error('Not support loading css in SSR'));
      // ignore css loading in SSR
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);

        link.onload = () => {
          resolve();
        };
        link.onerror = (e) => {
          reject(e);
        };
      });
    }
  }
}
