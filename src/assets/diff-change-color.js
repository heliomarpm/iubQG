(() => {
function init() {
  const flowName = '{{flowName}}';
  const oldVersion = {{oldVersion}};
  const newVersion = {{newVersion}};

	const defFluxo = document.querySelectorAll('.fluxo.ng-star-inserted');
	const dFlowName = defFluxo[0].textContent.trim();
	const dFlowVersion = parseInt(defFluxo[1].textContent, 10);

  if (dFlowName != flowName) {
    console.warn('Para visualizar o comparativo, abra jornada {{flowName}} na versão {{oldVersion}} e {{newVersion}}');
    return;
  }

	const blocks = {
		deleted: {{deletedBlocks}},
		recreated: {{recreatedBlocks}},
		recreatedUpdated: {{recreatedUpdatedBlocks}},
		updated: {{updatedBlocks}},
		added: {{addedBlocks}}
	};

  const colors = {
		deleted: '#E53935',
    recreated: '#f7c307',
    recreatedUpdated: '#FB8C00',
    updated: '#003d73',
    added: '#146718'
  };

	const elements = document.querySelectorAll('.parent-node');

  function applyColor(elements, activityList, color) {
    elements.forEach(element => {
      const activityName = element.children[0].children[1].children[1].children[0].textContent;
      if (activityList.includes(activityName)) {
        element.children[0].children[1].style.backgroundColor = color;
      }
    });
  }

  if (blocks.deleted.length > 0 && version < newVersion) {
    applyColor(elements, blocks.deleted, colors.deleted);
  }

  if (blocks.recreated.length) {
    applyColor(elements, blocks.recreated, colors.recreated);
  }

  if (blocks.recreatedUpdated.length) {
    applyColor(elements, blocks.recreatedUpdated, colors.recreatedUpdated);
  }

  if (blocks.updated.length) {
    applyColor(elements, blocks.updated, colors.updated);
  }

  if (blocks.added.length && version >= newVersion) {
    applyColor(elements, blocks.added, colors.added);
  }

  function createLegend() {
    const divLegend = document.createElement('div');
    divLegend.style = 'padding: 15px';
    divLegend.innerHTML = `
      <span>${flowName} - v${oldVersion} vs v${newVersion}</span>
      <ul style='list-style: none; color: white; width: 150px;'>
        <li style='background: ${colors.deleted}; margin: 2px; padding: 3px 6px; border-radius: 3px;'>removidos</li>
        <li style='background: ${colors.recreated}; margin: 2px; padding: 3px 6px; border-radius: 3px;'>recriado</li>
        <li style='background: ${colors.recreatedUpdated}; margin: 2px; padding: 3px 6px; border-radius: 3px;'>recriado e alterado</li>
        <li style='background: ${colors.updated}; margin: 2px; padding: 3px 6px; border-radius: 3px;'>alterado</li>
        <li style='background: ${colors.added}; margin: 2px; padding: 3px 6px; border-radius: 3px;'>incluido</li>
      </ul>
    `;

    const drawElement= document.querySelector('.draw-diagram');
		drawElement.parentNode.insertBefore(divLegend, drawElement);
  }

  createLegend();
}

init();
})();
