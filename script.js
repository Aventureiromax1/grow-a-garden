document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // BANCO DE DADOS E CONFIGURAÇÕES GERAIS
    // ===================================================================
    const CULTURAS = {
        milho: { nome: 'Milho', precoBase: 3, tempoCrescimento: 10, precoAtual: 3, ideal: { umidade: 50, temperatura: 22 } },
        tomate: { nome: 'Tomate', precoBase: 15, tempoCrescimento: 30, precoAtual: 15, ideal: { umidade: 65, temperatura: 26 } },
        batata: { nome: 'Batata', precoBase: 45, tempoCrescimento: 60, precoAtual: 45, ideal: { umidade: 75, temperatura: 18 } },
        cenoura: { nome: 'Cenoura', precoBase: 25, tempoCrescimento: 45, precoAtual: 25, ideal: { umidade: 60, temperatura: 20 } }
    };
    const INSUMOS = {
        semente_milho: { nome: 'Semente de Milho', preco: 1 },
        semente_tomate: { nome: 'Semente de Tomate', preco: 7 },
        semente_batata: { nome: 'Semente de Batata', preco: 20 },
        semente_cenoura: { nome: 'Semente de Cenoura', preco: 12 },
        agua: { nome: 'Água (100L)', preco: 10 }
    };
    const EQUIPAMENTOS = {
        ventilador: { nome: 'Ventilador', efeito: { temperatura: -2 }, preco: 250, raridade: 'comum' },
        umidificador: { nome: 'Umidificador', efeito: { umidade: 5 }, preco: 400, raridade: 'comum' },
        aquecedor: { nome: 'Aquecedor', efeito: { temperatura: 2 }, preco: 250, raridade: 'comum' },
        desumidificador: { nome: 'Desumidificador', efeito: { umidade: -5 }, preco: 400, raridade: 'comum' },
        ar_condicionado: { nome: 'Ar Condicionado', efeito: { temperatura: -5 }, preco: 1200, raridade: 'incomum' },
        irrigador_pro: { nome: 'Irrigador Pro', efeito: { umidade: 12 }, preco: 1500, raridade: 'incomum' },
        estufa_climatizada: { nome: 'Estufa Climatizada', efeito: { temperatura: 5, umidade: 10 }, preco: 5000, raridade: 'raro' }
    };

    // ===================================================================
    // ESTADO DO JOGO (SINGLE SOURCE OF TRUTH)
    // ===================================================================
    let gameState = {};

    function resetGameState() {
        gameState = {
            moedas: 200,
            inventario: { sementes: { milho: 10, tomate: 0, batata: 0, cenoura: 0 }, colheita: { milho: 0, tomate: 0, batata: 0, cenoura: 0 }, agua: 100, equipamentos: [] },
            ambiente: { temperatura: 20, umidade: 55 },
            sementeAtivaId: 'milho',
            autoClickerAtivo: false,
            idLoopAutoClicker: null,
            parcelasDeTerra: [],
            numeroParcelas: 5,
            custoProximaTerra: 80, // Custo inicial reduzido
            clickPower: 1, clickUpgradeCost: 25, clickUpgradeLevel: 0,
            helperLevel: 0, helperCost: 100,
            lojaCiclica: { itens: [], tempoRestante: 300 },
            graficoData: { labels: [], milho: [], tomate: [], batata: [], cenoura: [] },
            meusGraficos: {},
            mercadoAberto: false,
            gameRunning: false
        };
    }

    // ===================================================================
    // FUNÇÕES DE LÓGICA DO JOGO (Calculos, Ações)
    // ===================================================================
    const actions = {
        plantar: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'vazio'); if (p && gameState.inventario.sementes[gameState.sementeAtivaId] > 0) { gameState.inventario.sementes[gameState.sementeAtivaId]--; p.estado = 'plantado'; p.cultura = gameState.sementeAtivaId; } },
        regar: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'plantado'); if (p && gameState.inventario.agua > 0) { gameState.inventario.agua--; p.estado = 'crescendo'; p.tempoRestante = CULTURAS[p.cultura].tempoCrescimento; } },
        colher: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'pronto'); if (p) { const bonus = logic.calcularBonusDeAmbiente(p.cultura); const colheitaP = Math.max(1, Math.floor(gameState.clickPower * bonus)); gameState.inventario.colheita[p.cultura] += colheitaP; p.estado = 'vazio'; p.cultura = null; } },
        comprarTerra: () => { if (gameState.moedas >= gameState.custoProximaTerra) { gameState.moedas -= gameState.custoProximaTerra; gameState.numeroParcelas++; gameState.parcelasDeTerra.push({ id: gameState.numeroParcelas - 1, estado: 'vazio', cultura: null, tempoRestante: 0 }); gameState.custoProximaTerra = Math.floor(gameState.custoProximaTerra * 1.8); } },
        comprarInsumo: (id) => { if(gameState.moedas >= INSUMOS[id].preco) { gameState.moedas -= INSUMOS[id].preco; if (id.startsWith('semente_')) { gameState.inventario.sementes[id.replace('semente_', '')]++; } else if (id === 'agua') { gameState.inventario.agua += 100; } } },
        comprarEquipamento: (id, index) => { const itemLoja = gameState.lojaCiclica.itens[index]; const itemInfo = EQUIPAMENTOS[id]; if (gameState.moedas >= itemInfo.preco && itemLoja.estoque > 0) { gameState.moedas -= itemInfo.preco; itemLoja.estoque--; gameState.inventario.equipamentos.push(id); logic.recalcularAmbiente(); } },
        comprarMelhoria: (tipo) => { if(tipo === 'click' && gameState.moedas >= gameState.clickUpgradeCost) { gameState.moedas -= gameState.clickUpgradeCost; gameState.clickUpgradeLevel++; gameState.clickPower++; gameState.clickUpgradeCost = Math.floor(gameState.clickUpgradeCost * 1.6); } else if (tipo === 'helper' && gameState.moedas >= gameState.helperCost) { gameState.moedas -= gameState.helperCost; gameState.helperLevel++; gameState.helperCost = Math.floor(gameState.helperCost * 1.9); } },
        venderColheita: (id) => { if (gameState.inventario.colheita[id] > 0) { const qtd = gameState.inventario.colheita[id]; gameState.moedas += qtd * CULTURAS[id].precoAtual; gameState.inventario.colheita[id] = 0; } },
        selecionarSemente: (id) => { gameState.sementeAtivaId = id; },
        toggleAutoClique: () => { gameState.autoClickerAtivo = !gameState.autoClickerAtivo; if (gameState.autoClickerAtivo) { gameState.idLoopAutoClicker = setInterval(logic.cicloDeAcaoAutomatica, 3000); } else { clearInterval(gameState.idLoopAutoClicker); } },
        toggleMercado: () => { gameState.mercadoAberto = !gameState.mercadoAberto; }
    };
    
    const logic = {
        recalcularAmbiente: () => { gameState.ambiente = { temperatura: 20, umidade: 55 }; gameState.inventario.equipamentos.forEach(id => { const efeito = EQUIPAMENTOS[id].efeito; if (efeito.temperatura) gameState.ambiente.temperatura += efeito.temperatura; if (efeito.umidade) gameState.ambiente.umidade += efeito.umidade; }); },
        calcularBonusDeAmbiente: (culturaId) => { const ideal = CULTURAS[culturaId].ideal; let bonus = 1.0; const distTemp = Math.abs(gameState.ambiente.temperatura - ideal.temperatura); const distUmidade = Math.abs(gameState.ambiente.umidade - ideal.umidade); bonus -= (distTemp * 0.05 + distUmidade * 0.02); return Math.max(0.25, bonus); },
        cicloDeAcaoAutomatica: () => { const pPronta = gameState.parcelasDeTerra.find(p => p.estado === 'pronto'); if(pPronta) { actions.colher(); return; } const pPlantada = gameState.parcelasDeTerra.find(p => p.estado === 'plantado'); if(pPlantada) { actions.regar(); return; } const pVazia = gameState.parcelasDeTerra.find(p => p.estado === 'vazio'); if(pVazia) { actions.plantar(); } },
        atualizarLojaCiclica: () => { gameState.lojaCiclica.itens = []; const itensUnicos = new Set(); const itensPossiveis = Object.keys(EQUIPAMENTOS); while(itensUnicos.size < 2 && itensUnicos.size < itensPossiveis.length) { const rand = Math.random(); let acumulado = 0; for(const id of itensPossiveis) { const raridade = EQUIPAMENTOS[id].raridade; const chance = { comum: 0.6, incomum: 0.3, raro: 0.1 }[raridade]; acumulado += chance; if(rand < acumulado) { itensUnicos.add(id); break; } } } gameState.lojaCiclica.itens = Array.from(itensUnicos).map(id => ({ id: id, estoque: Math.random() < 0.7 ? 1 : 2 })); gameState.lojaCiclica.tempoRestante = 300; },
        atualizarPrecos: () => { for(const id in CULTURAS) { const c = CULTURAS[id]; const variacao = (Math.random() - 0.5) * (c.precoBase * 0.4); c.precoAtual = Math.max(c.precoBase * 0.5, c.precoBase + variacao); } }
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const render = {
        tudo: () => { if (!gameState.gameRunning) return; render.recursos(); render.fazendaStatus(); render.acoes(); render.melhorias(); render.mercado(); render.desabilitarBotoes(); },
        recursos: () => { const c = document.getElementById('recursos-container'); let s = ''; Object.keys(CULTURAS).forEach(k => s += `<p>Semente de ${CULTURAS[k].nome}: <span>${gameState.inventario.sementes[k]}</span></p>`); let h = ''; Object.keys(CULTURAS).forEach(k => h += `<p>${CULTURAS[k].nome} (Colhido): <span>${gameState.inventario.colheita[k]}</span></p>`); c.innerHTML = `<p>Moedas: <span>${Math.floor(gameState.moedas)}</span></p><p>Água: <span>${gameState.inventario.agua}</span></p>${s}${h}`; },
        fazendaStatus: () => {
            const c = document.getElementById('fazenda-status-container'); const e = { vazio: 0, plantado: 0, crescendo: 0, pronto: 0 }; gameState.parcelasDeTerra.forEach(p => e[p.estado]++); const pCrescendo = gameState.parcelasDeTerra.filter(p => p.estado === 'crescendo'); const tMinimo = pCrescendo.length > 0 ? Math.min(...pCrescendo.map(p => p.tempoRestante)) : 0;
            const crescendoTxt = e.crescendo > 0 ? `Crescendo: <span>${e.crescendo} (Próxima em ${tMinimo}s)</span>` : `Crescendo: <span>0</span>`;
            c.innerHTML = `<p>Você tem <span>${gameState.numeroParcelas}</span> parcelas de terra.</p><p>Vazias: <span>${e.vazio}</span></p><p>Plantadas: <span>${e.plantado}</span></p><p>${crescendoTxt}</p><p>Prontas: <span>${e.pronto}</span></p>`;
            document.getElementById('ambiente-container').innerHTML = `<p>Temperatura: <span>${gameState.ambiente.temperatura.toFixed(1)}°C</span></p><p>Umidade: <span>${gameState.ambiente.umidade.toFixed(1)}%</span></p>`;
            const equipC = document.getElementById('equipamentos-instalados-container'); equipC.innerHTML = gameState.inventario.equipamentos.length > 0 ? gameState.inventario.equipamentos.map(id => `<p>- ${EQUIPAMENTOS[id].nome}</p>`).join('') : `<p>Nenhum equipamento instalado.</p>`;
        },
        acoes: () => { const c = document.getElementById('acoes-container'); const bonus = logic.calcularBonusDeAmbiente(gameState.sementeAtivaId); const corBonus = bonus >= 1 ? 'green' : 'red'; let sHTML = ''; Object.keys(CULTURAS).forEach(id => sHTML += `<button data-action="selecionarSemente" data-id="${id}" class="${gameState.sementeAtivaId === id ? 'ativo' : ''}">${CULTURAS[id].nome}</button>`); c.innerHTML = `<p>Semente ativa: <span>${CULTURAS[gameState.sementeAtivaId].nome}</span></p><div class="botoes-selecao">${sHTML}</div><p><em>Tempo de Crescimento Base: <span>${CULTURAS[gameState.sementeAtivaId].tempoCrescimento}</span>s</em></p><p><strong>Bônus de Ambiente: <span style="color: ${corBonus};">${((bonus - 1) * 100).toFixed(0)}%</span></strong></p><div class="acao-item botoes-acao-container"><button data-action="plantar">Plantar</button><button data-action="regar">Regar</button><button data-action="colher">Colher</button></div><div class="acao-item"><button id="auto-clique" class="${gameState.autoClickerAtivo ? 'ativo' : ''}" data-action="toggleAutoClique">${gameState.autoClickerAtivo ? 'Auto-Ação (Ativado)' : 'Auto-Ação (Desativado)'}</button></div>`; },
        melhorias: () => { const c = document.getElementById('melhorias-container'); c.innerHTML = `<div class="melhoria-item"><h3>Comprar Terra</h3><p>Aumenta o número de parcelas para plantar.</p><button data-action="comprarTerra">Comprar (Custo: <span>${gameState.custoProximaTerra}</span> Moedas)</button></div><div class="melhoria-item"><h3>Melhorar Ferramentas</h3><p>Aumenta a colheita manual.</p><p>Nível: <span>${gameState.clickUpgradeLevel}</span> (+<span>${gameState.clickPower}</span>/colheita)</p><button data-action="comprarMelhoria" data-tipo="click">Comprar (Custo: <span>${gameState.clickUpgradeCost}</span> Moedas)</button></div><div class="melhoria-item"><h3>Contratar Ajudantes</h3><p>Realizam o ciclo de plantio automaticamente.</p><p>Ajudantes: <span>${gameState.helperLevel}</span></p><button data-action="comprarMelhoria" data-tipo="helper">Contratar (Custo: <span>${gameState.helperCost}</span> Moedas)</button></div>`; },
        mercado: () => {
            const container = document.getElementById('mercado-container'); const btn = document.getElementById('mercado-toggle-btn');
            if (gameState.mercadoAberto) {
                container.classList.remove('hidden'); btn.textContent = '(Fechar)';
                let insumosHTML = ''; Object.keys(INSUMOS).forEach(id => insumosHTML += `<button data-action="comprarInsumo" data-id="${id}">Comprar ${INSUMOS[id].nome} (${INSUMOS[id].preco} Moedas)</button>`);
                let vendasHTML = ''; Object.keys(CULTURAS).forEach(id => vendasHTML += `<button data-action="venderColheita" data-id="${id}">Vender ${CULTURAS[id].nome} (R$${CULTURAS[id].precoAtual.toFixed(2)})</button>`);
                const minutos = Math.floor(gameState.lojaCiclica.tempoRestante / 60); const segundos = gameState.lojaCiclica.tempoRestante % 60;
                let lojaHTML = ''; gameState.lojaCiclica.itens.forEach((item, index) => { const info = EQUIPAMENTOS[item.id]; const efeito = Object.entries(info.efeito).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v > 0 ? '+' : ''}${v}`).join(', '); lojaHTML += `<div class="item-mercado-ciclico raridade-${info.raridade}"><p><strong>${info.nome}</strong> (Estoque: ${item.estoque})</p><p><em>Efeito: ${efeito}</em></p><button data-action="comprarEquipamento" data-id="${item.id}" data-index="${index}">Comprar (${info.preco} Moedas)</button></div>`; });
                let graficosHTML = Object.keys(CULTURAS).map(id => `<div class="grafico-wrapper"><h4>${CULTURAS[id].nome}</h4><canvas id="grafico-${id}"></canvas></div>`).join('');
                container.innerHTML = `<div class="melhoria-item"><h3>Mercado Cíclico</h3><p><em>Novos itens em: <span>${minutos}:${segundos < 10 ? '0' : ''}${segundos}</span></em></p>${lojaHTML.length > 0 ? lojaHTML : '<p>Verificando estoque...</p>'}</div><div class="melhoria-item"><h3>Insumos</h3>${insumosHTML}</div><div class="melhoria-item"><h3>Vender Colheita</h3>${vendasHTML}</div><div class="melhoria-item"><h3>Gráficos de Preços</h3><div id="graficos-container">${graficosHTML}</div></div>`;
                render.iniciarGraficos();
            } else { container.classList.add('hidden'); btn.textContent = '(Abrir)'; }
        },
        iniciarGraficos: () => { for (const id in CULTURAS) { const canvas = document.getElementById(`grafico-${id}`); if (!canvas || gameState.meusGraficos[id]) continue; const ctx = canvas.getContext('2d'); const cores = {'milho': '#f0db4f', 'tomate': '#d9534f', 'batata': '#5d4037', 'cenoura': '#f0ad4e'}; gameState.meusGraficos[id] = new Chart(ctx, { type: 'line', data: { labels: gameState.graficoData.labels, datasets: [{ label: `Preço ${CULTURAS[id].nome}`, data: gameState.graficoData[id], borderColor: cores[id] || '#000', borderWidth: 2 }] }, options: { scales: { y: { beginAtZero: false } }, plugins: { legend: { display: false } } } }); } },
        atualizarGraficos: () => {
            Object.keys(CULTURAS).forEach(id => gameState.graficoData[id].push(CULTURAS[id].precoAtual.toFixed(2)));
            gameState.graficoData.labels.push('');
            if (gameState.graficoData.labels.length > 20) {
                gameState.graficoData.labels.shift();
                Object.keys(CULTURAS).forEach(id => gameState.graficoData[id].shift());
            }
            if (gameState.mercadoAberto) { Object.values(gameState.meusGraficos).forEach(chart => { if(chart) chart.update('quiet'); }); }
        },
        desabilitarBotoes: () => {
            if (!gameState.gameRunning) return;
            const e = { vazio: 0, plantado: 0, pronto: 0 }; gameState.parcelasDeTerra.forEach(p => e[p.estado]++);
            document.querySelector('[data-action="plantar"]').disabled = gameState.inventario.sementes[gameState.sementeAtivaId] <= 0 || e.vazio === 0;
            document.querySelector('[data-action="regar"]').disabled = gameState.inventario.agua === 0 || e.plantado === 0;
            document.querySelector('[data-action="colher"]').disabled = e.pronto === 0;
            document.querySelector('[data-action="comprarTerra"]').disabled = gameState.moedas < gameState.custoProximaTerra;
            document.querySelector('[data-action="comprarMelhoria"][data-tipo="click"]').disabled = gameState.moedas < gameState.clickUpgradeCost;
            document.querySelector('[data-action="comprarMelhoria"][data-tipo="helper"]').disabled = gameState.moedas < gameState.helperCost;
            if(gameState.mercadoAberto) {
                Object.keys(INSUMOS).forEach(id => { const btn = document.querySelector(`[data-action="comprarInsumo"][data-id="${id}"]`); if(btn) btn.disabled = gameState.moedas < INSUMOS[id].preco; });
                Object.keys(CULTURAS).forEach(id => { const btn = document.querySelector(`[data-action="venderColheita"][data-id="${id}"]`); if(btn) btn.disabled = gameState.inventario.colheita[id] <= 0; });
                gameState.lojaCiclica.itens.forEach((item, index) => { const info = EQUIPAMENTOS[item.id]; const btn = document.querySelector(`[data-action="comprarEquipamento"][data-index="${index}"]`); if(btn) btn.disabled = gameState.moedas < info.preco || item.estoque <= 0; });
            }
        }
    };

    // --- INICIALIZAÇÃO E LOOPS DE TEMPO ---
    function iniciarJogo() {
        resetGameState();
        for (let i = 0; i < gameState.numeroParcelas; i++) gameState.parcelasDeTerra.push({ id: i, estado: 'vazio', cultura: null, tempoRestante: 0 });
        gameState.gameRunning = true;
        document.getElementById('story-section').classList.add('hidden');
        document.getElementById('main-game-section').classList.remove('hidden');
        logic.atualizarLojaCiclica();
        iniciarLoops();
        render.tudo();
    }

    function iniciarLoops() {
        setInterval(() => { if (!gameState.gameRunning) return; let mudou = false; gameState.parcelasDeTerra.forEach(p => { if (p.estado === 'crescendo' && p.tempoRestante > 0) { p.tempoRestante--; mudou = true; if (p.tempoRestante <= 0) p.estado = 'pronto'; } }); if(mudou) { render.fazendaStatus(); render.desabilitarBotoes(); } }, 1000);
        setInterval(() => { if (gameState.gameRunning && gameState.helperLevel > 0) for (let i = 0; i < gameState.helperLevel; i++) logic.cicloDeAcaoAutomatica(); }, 5000 / (gameState.helperLevel || 1));
        setInterval(() => { if (!gameState.gameRunning) return; const custo = Math.floor(2 * gameState.numeroParcelas); gameState.moedas -= custo; if (gameState.moedas < 0) gameState.moedas = 0; }, 300000);
        setInterval(() => { if (!gameState.gameRunning) return; logic.atualizarPrecos(); logic.atualizarGraficos(); if(gameState.mercadoAberto) { render.mercado(); render.desabilitarBotoes(); } else { const btns = document.querySelectorAll('[data-action="venderColheita"]'); btns.forEach(b => {const id = b.dataset.id; if(id) b.textContent = `Vender ${CULTURAS[id].nome} (R$${CULTURAS[id].precoAtual.toFixed(2)})`})}}, 5000);
        setInterval(() => { if (!gameState.gameRunning) return; gameState.lojaCiclica.tempoRestante--; if(gameState.lojaCiclica.tempoRestante <= 0) logic.atualizarLojaCiclica(); if(gameState.mercadoAberto) render.mercado(); }, 1000);
    }

    // --- GERENCIADOR DE EVENTOS CENTRAL ---
    document.getElementById('game-engine').addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const action = target.dataset.action || target.id;
        if (action === 'start-game-btn') { iniciarJogo(); return; }
        if (!gameState.gameRunning) return;
        if(actions[action]) { actions[action](target.dataset.id || target.dataset.tipo, target.dataset.index); }
        render.tudo();
    });

    // --- PREPARA O JOGO ---
    resetGameState();
});