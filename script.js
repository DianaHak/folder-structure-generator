const treeContainer = document.getElementById('treeContainer');
const nodeTemplate = document.getElementById('nodeTemplate');
const output = document.getElementById('output');
const folderInput = document.getElementById('folderInput');

const addRootFolderBtn = document.getElementById('addRootFolderBtn');
const addRootFileBtn = document.getElementById('addRootFileBtn');
const expandAllBtn = document.getElementById('expandAllBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

const state = {
  nodes: [
    {
      id: uid(),
      type: 'folder',
      name: 'my-project',
      collapsed: false,
      children: [
        {
          id: uid(),
          type: 'folder',
          name: 'src',
          collapsed: false,
          children: [
            { id: uid(), type: 'file', name: 'index.js', children: [] },
            { id: uid(), type: 'file', name: 'utils.js', children: [] },
          ],
        },
        {
          id: uid(),
          type: 'folder',
          name: 'assets',
          collapsed: false,
          children: [
            { id: uid(), type: 'file', name: 'logo.svg', children: [] },
          ],
        },
        { id: uid(), type: 'file', name: 'README.md', children: [] },
        { id: uid(), type: 'file', name: 'package.json', children: [] },
      ],
    },
  ],
};

let dragContext = null;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function createNode(type, name = type === 'folder' ? 'new-folder' : 'new-file.txt') {
  return {
    id: uid(),
    type,
    name,
    collapsed: false,
    children: [],
  };
}

function render() {
  treeContainer.innerHTML = '';

  if (!state.nodes.length) {
    treeContainer.innerHTML = '<div class="empty-state">No items yet. Add a root folder or upload a folder from your computer.</div>';
    output.value = '';
    return;
  }

  state.nodes.forEach((node) => {
    treeContainer.appendChild(renderNode(node, state.nodes));
  });

  output.value = generateAsciiTree(state.nodes).join('\n');
}

function renderNode(node, siblingsArray) {
  const fragment = nodeTemplate.content.cloneNode(true);
  const wrapper = fragment.querySelector('.tree-node');
  const toggle = fragment.querySelector('.toggle');
  const nameEl = fragment.querySelector('.node-name');
  const inputEl = fragment.querySelector('.node-input');
  const childrenEl = fragment.querySelector('.children');
  const addFolderBtn = fragment.querySelector('.add-folder');
  const addFileBtn = fragment.querySelector('.add-file');
  const deleteBtn = fragment.querySelector('.delete');
  const nodeRow = fragment.querySelector('.node-row');

  wrapper.dataset.id = node.id;
  wrapper.dataset.type = node.type;

  if (node.collapsed) wrapper.classList.add('collapsed');
  if (!node.children?.length) wrapper.classList.add('no-children');

  nameEl.textContent = node.name;
  inputEl.value = node.name;

  if (node.type === 'file') {
    addFolderBtn.disabled = true;
    addFileBtn.disabled = true;
    addFolderBtn.style.opacity = '0.45';
    addFileBtn.style.opacity = '0.45';
  }

  toggle.addEventListener('click', () => {
    if (node.type !== 'folder') return;
    node.collapsed = !node.collapsed;
    render();
  });

  nameEl.addEventListener('dblclick', () => startRename(nameEl, inputEl, node));
  nameEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') startRename(nameEl, inputEl, node);
  });

  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') finishRename(nameEl, inputEl, node);
    if (event.key === 'Escape') cancelRename(nameEl, inputEl, node);
  });
  inputEl.addEventListener('blur', () => finishRename(nameEl, inputEl, node));

  addFolderBtn.addEventListener('click', () => {
    if (node.type !== 'folder') return;
    node.children.push(createNode('folder'));
    node.collapsed = false;
    render();
  });

  addFileBtn.addEventListener('click', () => {
    if (node.type !== 'folder') return;
    node.children.push(createNode('file'));
    node.collapsed = false;
    render();
  });

  deleteBtn.addEventListener('click', () => {
    const index = siblingsArray.findIndex((item) => item.id === node.id);
    if (index !== -1) siblingsArray.splice(index, 1);
    render();
  });

  wrapper.addEventListener('dragstart', (event) => {
    dragContext = { nodeId: node.id };
    wrapper.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
  });

  wrapper.addEventListener('dragend', () => {
    dragContext = null;
    wrapper.classList.remove('dragging');
  });

  nodeRow.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

  nodeRow.addEventListener('drop', (event) => {
    event.preventDefault();
    if (!dragContext || dragContext.nodeId === node.id) return;

    const extracted = removeNodeById(state.nodes, dragContext.nodeId);
    if (!extracted) return;

    if (node.type === 'folder') {
      node.children.push(extracted);
      node.collapsed = false;
    } else {
      const targetIndex = siblingsArray.findIndex((item) => item.id === node.id);
      siblingsArray.splice(targetIndex + 1, 0, extracted);
    }
    render();
  });

  if (node.children?.length) {
    node.children.forEach((child) => {
      childrenEl.appendChild(renderNode(child, node.children));
    });
  }

  return fragment;
}

function startRename(nameEl, inputEl, node) {
  nameEl.classList.add('hidden');
  inputEl.classList.remove('hidden');
  inputEl.value = node.name;
  inputEl.focus();
  inputEl.select();
}

function finishRename(nameEl, inputEl, node) {
  const value = inputEl.value.trim();
  node.name = value || node.name;
  nameEl.classList.remove('hidden');
  inputEl.classList.add('hidden');
  render();
}

function cancelRename(nameEl, inputEl, node) {
  inputEl.value = node.name;
  nameEl.classList.remove('hidden');
  inputEl.classList.add('hidden');
}

function removeNodeById(nodes, targetId) {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.id === targetId) {
      return nodes.splice(i, 1)[0];
    }
    if (node.children?.length) {
      const found = removeNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

function generateAsciiTree(nodes, prefix = '') {
  const lines = [];

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${connector}${node.name}`);

    if (node.children?.length) {
      const nextPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
      lines.push(...generateAsciiTree(node.children, nextPrefix));
    }
  });

  return lines;
}

function setAllCollapsed(nodes, collapsed) {
  nodes.forEach((node) => {
    if (node.type === 'folder') node.collapsed = collapsed;
    if (node.children?.length) setAllCollapsed(node.children, collapsed);
  });
}

function buildTreeFromFileList(fileList) {
  const roots = [];

  Array.from(fileList).forEach((file) => {
    const parts = file.webkitRelativePath.split('/').filter(Boolean);
    if (!parts.length) return;

    let currentLevel = roots;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && file.name === part;
      let existing = currentLevel.find((item) => item.name === part && item.type === (isFile ? 'file' : 'folder'));

      if (!existing) {
        existing = {
          id: uid(),
          type: isFile ? 'file' : 'folder',
          name: part,
          collapsed: false,
          children: isFile ? [] : [],
        };
        currentLevel.push(existing);
      }

      currentLevel = existing.children;
    });
  });

  return roots;
}

async function copyOutput() {
  const text = output.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy output';
    }, 1400);
  } catch (error) {
    alert('Copy failed in this browser. You can still select the text manually.');
  }
}

function downloadOutput() {
  const text = output.value.trim();
  if (!text) return;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'folder-structure.txt';
  link.click();
  URL.revokeObjectURL(url);
}

addRootFolderBtn.addEventListener('click', () => {
  state.nodes.push(createNode('folder'));
  render();
});

addRootFileBtn.addEventListener('click', () => {
  state.nodes.push(createNode('file'));
  render();
});

expandAllBtn.addEventListener('click', () => {
  setAllCollapsed(state.nodes, false);
  render();
});

collapseAllBtn.addEventListener('click', () => {
  setAllCollapsed(state.nodes, true);
  render();
});

clearBtn.addEventListener('click', () => {
  state.nodes = [];
  render();
});

copyBtn.addEventListener('click', copyOutput);
downloadBtn.addEventListener('click', downloadOutput);

folderInput.addEventListener('change', (event) => {
  const files = event.target.files;
  if (!files?.length) return;
  state.nodes = buildTreeFromFileList(files);
  render();
  folderInput.value = '';
});

render();
