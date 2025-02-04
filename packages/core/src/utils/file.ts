interface FileNode {
  isLeaf: boolean;
  name: string;
  children: FileNode[];
}

export function generateFileTree(files: string[]): FileNode[] {
  const fileTree: FileNode[] = [];

  for (const file of files) {
    const parts = file.split('/');
    let currentNode = fileTree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const existingNode = currentNode.find((node) => node.name === part);

      if (existingNode) {
        currentNode = existingNode.children;
      } else {
        const newNode: FileNode = {
          isLeaf: i === parts.length - 1,
          name: part,
          children: []
        };
        currentNode.push(newNode);
        currentNode = newNode.children;
      }
    }
  }

  return fileTree;
}

export function buildFileTreeHtml(node: FileNode[]): string {
  let html = '';

  for (const fileNode of node) {
    const { isLeaf, name, children } = fileNode;
    const indent = isLeaf ? '- ' : '|---- ';
    const path = name.replace(/ /g, '%20');
    html += `<div>${indent}<a href="${path}">${name}</a></div>`;
    if (!isLeaf) {
      html += buildFileTreeHtml(children).replace(
        /^/gm,
        '&nbsp;&nbsp;&nbsp;&nbsp;'
      );
    }
  }

  return html;
}

export function generateFileTreeHtml(node: FileNode[]): string {
  return `
      <!DOCTYPE html>
      <html lang="">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
          <title>Out Files</title>
        </head>
        <body>
          <!-- file tree-->
         <div>${buildFileTreeHtml(node)}</div>
        </body>
      </html>
      `;
}
