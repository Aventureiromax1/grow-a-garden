document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // BANCO DE DADOS E CONFIGURAÇÕES GERAIS
    // ===================================================================
    const SOLOS = { padrao: { nome: 'Solo Padrão', desc: 'Equilibrado, sem bônus.' }, arenoso: { nome: 'Solo Arenoso', desc: 'Ideal para culturas de raiz (+50% bônus).', requerPesquisa: 'desbloquear_solo_arenoso' }, argiloso: { nome: 'Solo Argiloso', desc: 'Rico em nutrientes para tubérculos (+50% bônus).', requerPesquisa: 'desbloquear_solo_argiloso' }, humoso: { nome: 'Solo Humoso', desc: 'Perfeito para frutas e vegetais delicados (+50% bônus).', requerPesquisa: 'desbloquear_solo_humoso' }, calcario: { nome: 'Solo Calcário', desc: 'Alcalino, favorece certas plantas como o milho (+50% bônus).', requerPesquisa: 'desbloquear_solo_calcario' } };
    const CULTURAS = { milho: { nome: 'Milho', precoBase: 3, tempoCrescimento: 10, precoNatural: 3, ideal: { umidade: 50, temperatura: 22 }, soloPreferido: 'calcario' }, tomate: { nome: 'Tomate', precoBase: 15, tempoCrescimento: 30, precoNatural: 15, ideal: { umidade: 65, temperatura: 26 }, soloPreferido: 'humoso', requerPesquisa: 'desbloquear_tomate' }, batata: { nome: 'Batata', precoBase: 45, tempoCrescimento: 60, precoNatural: 45, ideal: { umidade: 75, temperatura: 18 }, soloPreferido: 'argiloso', requerPesquisa: 'desbloquear_batata' }, cenoura: { nome: 'Cenoura', precoBase: 25, tempoCrescimento: 45, precoNatural: 25, ideal: { umidade: 60, temperatura: 20 }, soloPreferido: 'arenoso', requerPesquisa: 'desbloquear_cenoura' }, morango: { nome: 'Morango', precoBase: 80, tempoCrescimento: 90, precoNatural: 80, ideal: { umidade: 70, temperatura: 24 }, soloPreferido: 'humoso', requerPesquisa: 'desbloquear_morango' }, abobora: { nome: 'Abóbora', precoBase: 150, tempoCrescimento: 120, precoNatural: 150, ideal: { umidade: 80, temperatura: 28 }, soloPreferido: 'argiloso', requerPesquisa: 'desbloquear_abobora' } };
    const INSUMOS = { semente_milho: { nome: 'Semente de Milho', preco: 1 }, semente_tomate: { nome: 'Semente de Tomate', preco: 7, requerPesquisa: 'desbloquear_tomate' }, semente_batata: { nome: 'Semente de Batata', preco: 20, requerPesquisa: 'desbloquear_batata' }, semente_cenoura: { nome: 'Semente de Cenoura', preco: 12, requerPesquisa: 'desbloquear_cenoura' }, semente_morango: { nome: 'Semente de Morango', preco: 40, requerPesquisa: 'desbloquear_morango' }, semente_abobora: { nome: 'Semente de Abóbora', preco: 70, requerPesquisa: 'desbloquear_abobora' }, agua: { nome: 'Água (100L)', preco: 10 } };
    const EQUIPAMENTOS = { ventilador: { nome: 'Ventilador', efeito: { temperatura: -2 }, preco: 250, raridade: 'comum', requerPesquisa: 'desbloquear_equip_basicos' }, umidificador: { nome: 'Umidificador', efeito: { umidade: 5 }, preco: 400, raridade: 'comum', requerPesquisa: 'desbloquear_equip_basicos' }, aquecedor: { nome: 'Aquecedor', efeito: { temperatura: 2 }, preco: 250, raridade: 'comum', requerPesquisa: 'desbloquear_equip_basicos' }, desumidificador: { nome: 'Desumidificador', efeito: { umidade: -5 }, preco: 400, raridade: 'comum', requerPesquisa: 'desbloquear_equip_basicos' }, ar_condicionado: { nome: 'Ar Condicionado', efeito: { temperatura: -5 }, preco: 1200, raridade: 'incomum', requerPesquisa: 'desbloquear_equip_avancados' }, irrigador_pro: { nome: 'Irrigador Pro', efeito: { umidade: 12 }, preco: 1500, raridade: 'incomum', requerPesquisa: 'desbloquear_equip_avancados' }, climatizador_industrial: { nome: 'Climatizador Industrial', efeito: { temperatura: -8, umidade: 8 }, preco: 6000, raridade: 'raro', requerPesquisa: 'desbloquear_equip_expert' } };
    const EVENTOS = [ { id: 'FESTIVAL', nome: 'Festival da Colheita!', descricao: 'A demanda por tomate está nas alturas!', tipo: 'bom', duracao: 60, chance: 0.05, efeito: { culturaId: 'tomate', multiplicador: 2.0 } }, { id: 'PRAGA', nome: 'Praga de Gafanhotos!', descricao: 'Uma praga terrível devastou as plantações de milho.', tipo: 'ruim', duracao: 90, chance: 0.05, efeito: { culturaId: 'milho', multiplicador: 0.5 } }, { id: 'SECA', nome: 'Onda de Calor e Seca', descricao: 'A falta de chuva aumenta o valor das batatas e cenouras.', tipo: 'bom', duracao: 75, chance: 0.04, efeito: { culturaId: ['batata', 'cenoura'], multiplicador: 1.5 } }, { id: 'SUPERPRODUCAO', nome: 'Superprodução de Abóboras', descricao: 'O mercado está inundado de abóboras, derrubando os preços.', tipo: 'ruim', duracao: 120, chance: 0.04, efeito: { culturaId: 'abobora', multiplicador: 0.4 } } ];
    
    // ÁRVORE DE PESQUISA COM POSIÇÕES REAJUSTADAS E MAIS COMPACTAS
    const ARVORE_DE_PESQUISA = {
        'raiz': { nome: "Agricultura Básica", desc: "O começo de tudo.", custo: 0, desbloqueado: true, pos: { x: 50, y: 50 } },
        // Ramo de CULTURAS (para baixo)
        'desbloquear_tomate': { nome: "Cultivo de Tomates", desc: "Desbloqueia Tomates.", custo: 25, dependeDe: 'raiz', pos: { x: 50, y: 68 } },
        'desbloquear_cenoura': { nome: "Horticultura", desc: "Desbloqueia Cenouras.", custo: 75, dependeDe: 'desbloquear_tomate', pos: { x: 40, y: 85 } },
        'desbloquear_batata': { nome: "Tubericultura", desc: "Desbloqueia Batatas.", custo: 150, dependeDe: 'desbloquear_tomate', pos: { x: 60, y: 85 } },
        'desbloquear_morango': { nome: "Fruticultura", desc: "Desbloqueia Morangos.", custo: 250, dependeDe: 'desbloquear_cenoura', pos: { x: 30, y: 100 } },
        'desbloquear_abobora': { nome: "Cucurbitáceas", desc: "Desbloqueia Abóboras.", custo: 400, dependeDe: 'desbloquear_batata', pos: { x: 70, y: 100 } },
        // Ramo de SOLOS (para a esquerda)
        'ciencia_do_solo': { nome: "Ciência do Solo", desc: "Estude a composição da terra.", custo: 50, dependeDe: 'raiz', pos: { x: 32, y: 50 } },
        'desbloquear_solo_humoso': { nome: "Solo Humoso", desc: "Para Tomates e Morangos.", custo: 100, dependeDe: 'ciencia_do_solo', pos: { x: 18, y: 40 } },
        'desbloquear_solo_arenoso': { nome: "Solo Arenoso", desc: "Para Cenouras.", custo: 100, dependeDe: 'ciencia_do_solo', pos: { x: 18, y: 60 } },
        'desbloquear_solo_argiloso': { nome: "Solo Argiloso", desc: "Para Batatas e Abóboras.", custo: 200, dependeDe: 'desbloquear_solo_arenoso', pos: { x: 4, y: 50 } },
        'desbloquear_solo_calcario': { nome: "Solo Calcário", desc: "Para Milho.", custo: 200, dependeDe: 'desbloquear_solo_humoso', pos: { x: 18, y: 25 } },
        // Ramo de MELHORIAS (para a direita)
        'melhoria_colheita_1': { nome: "Ferramentas Melhores", desc: "Aumenta a colheita base.", custo: 100, dependeDe: 'raiz', tipo: 'passiva', efeito: () => { gameState.clickPower++; }, pos: { x: 68, y: 50 } },
        'melhoria_ajudante_1': { nome: "Gerência de Equipe", desc: "Ajudantes 10% mais rápidos.", custo: 200, dependeDe: 'melhoria_colheita_1', tipo: 'passiva', efeito: () => { gameState.bonusVelocidadeAjudante *= 0.9; }, pos: { x: 85, y: 50 } },
        'desbloquear_equip_basicos': { nome: "Engenharia de Campo", desc: "Desbloqueia equipamentos básicos.", custo: 300, dependeDe: 'melhoria_ajudante_1', pos: { x: 85, y: 32 } },
        'desbloquear_equip_avancados': { nome: "Climatização Avançada", desc: "Desbloqueia equipamentos avançados.", custo: 1000, dependeDe: 'desbloquear_equip_basicos', pos: { x: 85, y: 15 } },
        'desbloquear_equip_expert': { nome: "Equipamentos Expert", desc: "Desbloqueia equipamentos de ponta.", custo: 2500, dependeDe: 'desbloquear_equip_avancados', pos: { x: 68, y: 5 } }
    };
    
    // ===================================================================
    // ESTADO DO JOGO
    // ===================================================================
    let gameState = {};

    function resetGameState() {
        gameState = {
            moedas: 200, inventario: { sementes: { milho: 10, tomate: 0, batata: 0, cenoura: 0, morango: 0, abobora: 0 }, colheita: { milho: 0, tomate: 0, batata: 0, cenoura: 0, morango: 0, abobora: 0 }, agua: 100, equipamentos: [] },
            ambiente: { temperatura: 20, umidade: 55 }, sementeAtivaId: 'milho', soloAtivoId: 'padrao', autoClickerAtivo: false, idLoopAutoClicker: null,
            parcelasDeTerra: [], numeroParcelas: 5, custoProximaTerra: 80,
            clickPower: 1, clickUpgradeCost: 25, clickUpgradeLevel: 0, helperLevel: 0, helperCost: 100, bonusVelocidadeAjudante: 1.0,
            lojaCiclica: { itens: [], tempoRestante: 300 },
            graficoData: { labels: [], milho: [], tomate: [], batata: [], cenoura: [], morango: [], abobora: [] },
            meusGraficos: {}, mercadoAberto: false, gameRunning: false, eventoAtivo: null,
            pontosDePesquisa: 0, pesquisasConcluidas: ['raiz'], pesquisaAberta: false,
            panOffset: { x: 0, y: 0 }, panStart: { x: 0, y: 0 }, isPanning: false
        };
    }

    // ===================================================================
    // LÓGICA DO JOGO
    // ===================================================================
    const actions = {
        plantar: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'vazio'); if (p && gameState.inventario.sementes[gameState.sementeAtivaId] > 0) { gameState.inventario.sementes[gameState.sementeAtivaId]--; p.estado = 'plantado'; p.cultura = gameState.sementeAtivaId; gameState.pontosDePesquisa++; } },
        regar: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'plantado'); if (p && gameState.inventario.agua > 0) { gameState.inventario.agua--; p.estado = 'crescendo'; p.tempoRestante = CULTURAS[p.cultura].tempoCrescimento; } },
        colher: () => { const p = gameState.parcelasDeTerra.find(p => p.estado === 'pronto'); if (p) { const bonus = logic.calcularBonusDeAmbiente(p.cultura); const colheitaP = Math.max(1, Math.floor(gameState.clickPower * bonus)); gameState.inventario.colheita[p.cultura] += colheitaP; p.estado = 'vazio'; p.cultura = null; } },
        comprarTerra: () => { if (gameState.moedas >= gameState.custoProximaTerra) { gameState.moedas -= gameState.custoProximaTerra; gameState.numeroParcelas++; gameState.parcelasDeTerra.push({ id: gameState.numeroParcelas - 1, estado: 'vazio', cultura: null, tempoRestante: 0 }); gameState.custoProximaTerra = Math.floor(gameState.custoProximaTerra * 1.8); } },
        comprarInsumo: (id) => { if(gameState.moedas >= INSUMOS[id].preco) { gameState.moedas -= INSUMOS[id].preco; if (id.startsWith('semente_')) { gameState.inventario.sementes[id.replace('semente_', '')]++; } else if (id === 'agua') { gameState.inventario.agua += 100; } } },
        comprarEquipamento: (id, index) => { const itemLoja = gameState.lojaCiclica.itens[index]; const itemInfo = EQUIPAMENTOS[id]; if (gameState.moedas >= itemInfo.preco && itemLoja.estoque > 0) { gameState.moedas -= itemInfo.preco; itemLoja.estoque--; gameState.inventario.equipamentos.push(id); logic.recalcularAmbiente(); } },
        comprarMelhoria: (tipo) => { if(tipo === 'click' && gameState.moedas >= gameState.clickUpgradeCost) { gameState.moedas -= gameState.clickUpgradeCost; gameState.clickUpgradeLevel++; gameState.clickPower++; gameState.clickUpgradeCost = Math.floor(gameState.clickUpgradeCost * 1.6); } else if (tipo === 'helper' && gameState.moedas >= gameState.helperCost) { gameState.moedas -= gameState.helperCost; gameState.helperLevel++; gameState.helperCost = Math.floor(gameState.helperCost * 1.9); } },
        venderColheita: (id) => { if (gameState.inventario.colheita[id] > 0) { const qtd = gameState.inventario.colheita[id]; const precoFinal = logic.getPrecoDeVenda(id); gameState.moedas += qtd * precoFinal; gameState.inventario.colheita[id] = 0; } },
        selecionarSemente: (id) => { gameState.sementeAtivaId = id; },
        selecionarSolo: (id) => { gameState.soloAtivoId = id; },
        toggleAutoClique: () => { gameState.autoClickerAtivo = !gameState.autoClickerAtivo; if (gameState.autoClickerAtivo) { gameState.idLoopAutoClicker = setInterval(logic.cicloDeAcaoAutomatica, 3000); } else { clearInterval(gameState.idLoopAutoClicker); } },
        toggleMercado: () => { gameState.mercadoAberto = !gameState.mercadoAberto; },
        togglePesquisa: () => { gameState.pesquisaAberta = !gameState.pesquisaAberta; },
        realizarPesquisa: (id) => { const pesquisa = ARVORE_DE_PESQUISA[id]; if (!pesquisa || gameState.pesquisasConcluidas.includes(id)) return; const preRequisitoOk = gameState.pesquisasConcluidas.includes(pesquisa.dependeDe); if (preRequisitoOk && gameState.pontosDePesquisa >= pesquisa.custo) { gameState.pontosDePesquisa -= pesquisa.custo; gameState.pesquisasConcluidas.push(id); if(pesquisa.efeito) pesquisa.efeito(); } }
    };
    
    const logic = {
        recalcularAmbiente: () => { gameState.ambiente = { temperatura: 20, umidade: 55 }; gameState.inventario.equipamentos.forEach(id => { const efeito = EQUIPAMENTOS[id].efeito; if (efeito.temperatura) gameState.ambiente.temperatura += efeito.temperatura; if (efeito.umidade) gameState.ambiente.umidade += efeito.umidade; }); },
        calcularBonusDeAmbiente: (culturaId) => { let bonusFinal = 1.0; const ideal = CULTURAS[culturaId].ideal; let bonusClima = 1.0; const distTemp = Math.abs(gameState.ambiente.temperatura - ideal.temperatura); const distUmidade = Math.abs(gameState.ambiente.umidade - ideal.umidade); bonusClima -= (distTemp * 0.05 + distUmidade * 0.02); let bonusSolo = 1.0; if (CULTURAS[culturaId].soloPreferido === gameState.soloAtivoId) { bonusSolo = 1.5; } bonusFinal = bonusClima * bonusSolo; return Math.max(0.25, bonusFinal); },
        cicloDeAcaoAutomatica: () => { const pPronta = gameState.parcelasDeTerra.find(p => p.estado === 'pronto'); if(pPronta) { actions.colher(); return; } const pPlantada = gameState.parcelasDeTerra.find(p => p.estado === 'plantado'); if(pPlantada) { actions.regar(); return; } const pVazia = gameState.parcelasDeTerra.find(p => p.estado === 'vazio'); if(pVazia) { actions.plantar(); } },
        atualizarLojaCiclica: () => { gameState.lojaCiclica.itens = []; const itensUnicos = new Set(); const itensPossiveis = Object.keys(EQUIPAMENTOS).filter(id => gameState.pesquisasConcluidas.includes(EQUIPAMENTOS[id].requerPesquisa)); while(itensUnicos.size < 2 && itensUnicos.size < itensPossiveis.length) { const rand = Math.random(); let acumulado = 0; for(const id of itensPossiveis) { const raridade = EQUIPAMENTOS[id].raridade; const chance = { comum: 0.6, incomum: 0.3, raro: 0.1 }[raridade]; acumulado += chance; if(rand < acumulado) { itensUnicos.add(id); break; } } } gameState.lojaCiclica.itens = Array.from(itensUnicos).map(id => ({ id: id, estoque: Math.random() < 0.7 ? 1 : 2 })); gameState.lojaCiclica.tempoRestante = 300; },
        atualizarPrecos: () => { for (const id in CULTURAS) { const c = CULTURAS[id]; const desvio = c.precoNatural / c.precoBase; const choqueAleatorio = (Math.random() - 0.5) * 2; const tamanhoDoChoque = c.precoBase * 0.05; const forcaCorretiva = (c.precoBase - c.precoNatural) * 0.1; c.precoNatural += (choqueAleatorio * tamanhoDoChoque) + forcaCorretiva; c.precoNatural = Math.min(c.precoNatural, c.precoBase * 5); c.precoNatural = Math.max(c.precoNatural, c.precoBase * 0.2); } },
        getPrecoDeVenda: (culturaId) => { let precoFinal = CULTURAS[culturaId].precoNatural; if (gameState.eventoAtivo) { const e = gameState.eventoAtivo; const eAfetaCultura = Array.isArray(e.efeito.culturaId) ? e.efeito.culturaId.includes(culturaId) : e.efeito.culturaId === culturaId; if (eAfetaCultura) { precoFinal *= e.efeito.multiplicador; } } return precoFinal; },
        verificarEvento: () => { if (gameState.eventoAtivo) return; for (const evento of EVENTOS) { if (Math.random() < evento.chance) { gameState.eventoAtivo = { ...evento, tempoRestante: evento.duracao }; break; } } },
        simularHistoricoDePrecos: () => { for (let i = 0; i < 20; i++) { logic.atualizarPrecos(); gameState.graficoData.labels.push(''); for (const id in CULTURAS) { gameState.graficoData[id].push(logic.getPrecoDeVenda(id).toFixed(2)); } } }
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const render = {
        tudo: () => { if (!gameState.gameRunning) return; render.recursos(); render.fazendaStatus(); render.acoes(); render.melhorias(); render.mercado(); render.evento(); render.pesquisa(); render.desabilitarBotoes(); },
        recursos: () => { const c = document.getElementById('recursos-container'); let s = ''; Object.keys(CULTURAS).filter(k => !CULTURAS[k].requerPesquisa || gameState.pesquisasConcluidas.includes(CULTURAS[k].requerPesquisa)).forEach(k => s += `<p>Semente de ${CULTURAS[k].nome}: <span>${gameState.inventario.sementes[k]}</span></p>`); let h = ''; Object.keys(CULTURAS).filter(k => !CULTURAS[k].requerPesquisa || gameState.pesquisasConcluidas.includes(CULTURAS[k].requerPesquisa)).forEach(k => h += `<p>${CULTURAS[k].nome} (Colhido): <span>${gameState.inventario.colheita[k]}</span></p>`); c.innerHTML = `<p>Moedas: <span>${Math.floor(gameState.moedas)}</span></p><p>Água: <span>${gameState.inventario.agua}</span></p><p>Pontos (PP): <span>${gameState.pontosDePesquisa}</span></p>${s}${h}`; },
        fazendaStatus: () => {
            const c = document.getElementById('fazenda-status-container'); const e = { vazio: 0, plantado: 0, crescendo: 0, pronto: 0 }; gameState.parcelasDeTerra.forEach(p => e[p.estado]++); const pCrescendo = gameState.parcelasDeTerra.filter(p => p.estado === 'crescendo'); const tMinimo = pCrescendo.length > 0 ? Math.min(...pCrescendo.map(p => p.tempoRestante)) : 0;
            const crescendoTxt = e.crescendo > 0 ? `Crescendo: <span>${e.crescendo} (Próxima em ${tMinimo}s)</span>` : `Crescendo: <span>0</span>`;
            let solosHTML = ''; Object.keys(SOLOS).filter(id => !SOLOS[id].requerPesquisa || gameState.pesquisasConcluidas.includes(SOLOS[id].requerPesquisa)).forEach(id => solosHTML += `<button data-action="selecionarSolo" data-id="${id}" class="${gameState.soloAtivoId === id ? 'ativo' : ''}" title="${SOLOS[id].desc}">${SOLOS[id].nome}</button>`);
            document.getElementById('selecao-solo-container').innerHTML = `<div class="botoes-selecao">${solosHTML}</div>`;
            c.innerHTML = `<p>Você tem <span>${gameState.numeroParcelas}</span> parcelas de terra.</p><p>Vazias: <span>${e.vazio}</span></p><p>Plantadas: <span>${e.plantado}</span></p><p>${crescendoTxt}</p><p>Prontas: <span>${e.pronto}</span></p>`;
            document.getElementById('ambiente-container').innerHTML = `<p>Temperatura: <span>${gameState.ambiente.temperatura.toFixed(1)}°C</span></p><p>Umidade: <span>${gameState.ambiente.umidade.toFixed(1)}%</span></p>`;
            const equipC = document.getElementById('equipamentos-instalados-container'); equipC.innerHTML = gameState.inventario.equipamentos.length > 0 ? gameState.inventario.equipamentos.map(id => `<p>- ${EQUIPAMENTOS[id].nome}</p>`).join('') : `<p>Nenhum equipamento instalado.</p>`;
        },
        acoes: () => { const c = document.getElementById('acoes-container'); const bonus = logic.calcularBonusDeAmbiente(gameState.sementeAtivaId); const corBonus = bonus >= 1 ? 'green' : 'red'; let sHTML = ''; Object.keys(CULTURAS).filter(id => !CULTURAS[id].requerPesquisa || gameState.pesquisasConcluidas.includes(CULTURAS[id].requerPesquisa)).forEach(id => sHTML += `<button data-action="selecionarSemente" data-id="${id}" class="${gameState.sementeAtivaId === id ? 'ativo' : ''}">${CULTURAS[id].nome}</button>`); c.innerHTML = `<p>Semente ativa: <span>${CULTURAS[gameState.sementeAtivaId].nome}</span></p><div class="botoes-selecao">${sHTML}</div><p><em>Tempo de Crescimento Base: <span>${CULTURAS[gameState.sementeAtivaId].tempoCrescimento}</span>s</em></p><p><strong>Bônus de Produção Total: <span style="color: ${corBonus};">${((bonus - 1) * 100).toFixed(0)}%</span></strong></p><div class="acao-item botoes-acao-container"><button data-action="plantar">Plantar</button><button data-action="regar">Regar</button><button data-action="colher">Colher</button></div><div class="acao-item"><button id="auto-clique" class="${gameState.autoClickerAtivo ? 'ativo' : ''}" data-action="toggleAutoClique">${gameState.autoClickerAtivo ? 'Auto-Ação (Ativado)' : 'Auto-Ação (Desativado)'}</button></div>`; },
        melhorias: () => { const c = document.getElementById('melhorias-container'); c.innerHTML = `<div class="melhoria-item"><h3>Comprar Terra</h3><p>Aumenta o número de parcelas para plantar.</p><button data-action="comprarTerra">Comprar (Custo: <span>${gameState.custoProximaTerra}</span> Moedas)</button></div><div class="melhoria-item"><h3>Melhorar Ferramentas</h3><p>Aumenta a colheita manual.</p><p>Nível: <span>${gameState.clickUpgradeLevel}</span> (+<span>${gameState.clickPower}</span>/colheita)</p><button data-action="comprarMelhoria" data-tipo="click">Comprar (Custo: <span>${gameState.clickUpgradeCost}</span> Moedas)</button></div><div class="melhoria-item"><h3>Contratar Ajudantes</h3><p>Realizam o ciclo de plantio automaticamente.</p><p>Ajudantes: <span>${gameState.helperLevel}</span></p><button data-action="comprarMelhoria" data-tipo="helper">Contratar (Custo: <span>${gameState.helperCost}</span> Moedas)</button></div>`; },
        mercado: () => {
            const container = document.getElementById('mercado-container'); const btn = document.getElementById('mercado-toggle-btn');
            if (gameState.mercadoAberto) {
                container.classList.remove('hidden'); btn.textContent = '(Fechar)';
                let insumosHTML = ''; Object.keys(INSUMOS).filter(id => !INSUMOS[id].requerPesquisa || gameState.pesquisasConcluidas.includes(INSUMOS[id].requerPesquisa)).forEach(id => insumosHTML += `<button data-action="comprarInsumo" data-id="${id}">Comprar ${INSUMOS[id].nome} (${INSUMOS[id].preco} Moedas)</button>`);
                let vendasHTML = ''; Object.keys(CULTURAS).filter(id => !CULTURAS[id].requerPesquisa || gameState.pesquisasConcluidas.includes(CULTURAS[id].requerPesquisa)).forEach(id => vendasHTML += `<button data-action="venderColheita" data-id="${id}">Vender ${CULTURAS[id].nome} (R$${logic.getPrecoDeVenda(id).toFixed(2)})</button>`);
                const minutos = Math.floor(gameState.lojaCiclica.tempoRestante / 60); const segundos = gameState.lojaCiclica.tempoRestante % 60;
                let lojaHTML = ''; gameState.lojaCiclica.itens.forEach((item, index) => { const info = EQUIPAMENTOS[item.id]; const efeito = Object.entries(info.efeito).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v > 0 ? '+' : ''}${v}`).join(', '); lojaHTML += `<div class="item-mercado-ciclico raridade-${info.raridade}"><p><strong>${info.nome}</strong> (Estoque: ${item.estoque})</p><p><em>Efeito: ${efeito}</em></p><button data-action="comprarEquipamento" data-id="${item.id}" data-index="${index}">Comprar (${info.preco} Moedas)</button></div>`; });
                let graficosHTML = Object.keys(CULTURAS).filter(id => !CULTURAS[id].requerPesquisa || gameState.pesquisasConcluidas.includes(CULTURAS[id].requerPesquisa)).map(id => `<div class="grafico-wrapper"><h4>${CULTURAS[id].nome}</h4><canvas id="grafico-${id}"></canvas></div>`).join('');
                container.innerHTML = `<div class="melhoria-item"><h3>Mercado Cíclico</h3><p><em>Novos itens em: <span>${minutos}:${segundos < 10 ? '0' : ''}${segundos}</span></em></p>${lojaHTML.length > 0 ? lojaHTML : '<p>Nenhum equipamento raro disponível.</p>'}</div><div class="melhoria-item"><h3>Insumos</h3>${insumosHTML}</div><div class="melhoria-item"><h3>Vender Colheita</h3>${vendasHTML}</div><div class="melhoria-item"><h3>Gráficos de Preços</h3><div id="graficos-container">${graficosHTML}</div></div>`;
                render.iniciarGraficos();
            } else { container.classList.add('hidden'); btn.textContent = '(Abrir)'; }
        },
        pesquisa: () => {
            const overlay = document.getElementById('pesquisa-overlay');
            if (gameState.pesquisaAberta) {
                overlay.classList.remove('hidden');
                const nodesContainer = document.getElementById('pesquisa-nodes-container'); const svgContainer = document.getElementById('pesquisa-svg-container'); nodesContainer.innerHTML = ''; svgContainer.innerHTML = '';
                nodesContainer.style.transform = `translate(${gameState.panOffset.x}px, ${gameState.panOffset.y}px)`; svgContainer.style.transform = `translate(${gameState.panOffset.x}px, ${gameState.panOffset.y}px)`;
                for (const id in ARVORE_DE_PESQUISA) {
                    const node = ARVORE_DE_PESQUISA[id]; const nodeDiv = document.createElement('div'); nodeDiv.className = 'node-pesquisa'; nodeDiv.style.left = `${node.pos.x}%`; nodeDiv.style.top = `${node.pos.y}%`; nodeDiv.innerHTML = `<strong>${node.nome}</strong><p>${node.desc}</p><p class="custo">Custo: ${node.custo} PP</p>`;
                    const isConcluido = gameState.pesquisasConcluidas.includes(id); const preRequisitoOk = !node.dependeDe || gameState.pesquisasConcluidas.includes(node.dependeDe); const temPontos = gameState.pontosDePesquisa >= node.custo;
                    if (isConcluido) { nodeDiv.classList.add('concluido'); } else if (preRequisitoOk && temPontos) { nodeDiv.classList.add('disponivel'); nodeDiv.dataset.action = 'realizarPesquisa'; nodeDiv.dataset.id = id; } else { nodeDiv.classList.add('bloqueado'); }
                    nodesContainer.appendChild(nodeDiv);
                    if (node.dependeDe) {
                        const parentNode = ARVORE_DE_PESQUISA[node.dependeDe]; const line = document.createElementNS('http://www.w3.org/2000/svg','line'); const nodeWidth = 130; const nodeHeight = 100;
                        const parentEl = {offsetLeft: parentNode.pos.x / 100 * nodesContainer.offsetWidth, offsetTop: parentNode.pos.y / 100 * nodesContainer.offsetHeight }; const childEl = {offsetLeft: node.pos.x / 100 * nodesContainer.offsetWidth, offsetTop: node.pos.y / 100 * nodesContainer.offsetHeight };
                        line.setAttribute('x1', parentEl.offsetLeft + nodeWidth/2); line.setAttribute('y1', parentEl.offsetTop + nodeHeight); line.setAttribute('x2', childEl.offsetLeft + nodeWidth/2); line.setAttribute('y2', childEl.offsetTop);
                        line.setAttribute('class', isConcluido || preRequisitoOk ? 'linha-desbloqueada' : 'linha-bloqueada'); svgContainer.appendChild(line);
                    }
                }
            } else { overlay.classList.add('hidden'); }
        },
        evento: () => { const c = document.getElementById('evento-container'); if (gameState.eventoAtivo) { const e = gameState.eventoAtivo; c.innerHTML = `<h3>${e.nome}</h3><p>${e.descricao}</p><p><em>Tempo restante: ${e.tempoRestante}s</em></p>`; c.className = `evento-${e.tipo}`; } else { c.className = 'hidden'; } },
        iniciarGraficos: () => { for (const id in CULTURAS) { if (gameState.meusGraficos[id]) { gameState.meusGraficos[id].destroy(); delete gameState.meusGraficos[id]; } const canvas = document.getElementById(`grafico-${id}`); if (!canvas) continue; const ctx = canvas.getContext('2d'); const cores = {'milho': '#f0db4f', 'tomate': '#d9534f', 'batata': '#5d4037', 'cenoura': '#f0ad4e', 'morango': '#e83e8c', 'abobora': '#fd7e14'}; gameState.meusGraficos[id] = new Chart(ctx, { type: 'line', data: { labels: gameState.graficoData.labels, datasets: [{ label: `Preço ${CULTURAS[id].nome}`, data: gameState.graficoData[id], borderColor: cores[id] || '#000', borderWidth: 2 }] }, options: { scales: { y: { beginAtZero: false } }, plugins: { legend: { display: false } } } }); } },
        atualizarGraficos: () => { if (gameState.mercadoAberto) { Object.values(gameState.meusGraficos).forEach(chart => { if(chart) chart.update('quiet'); }); } },
        desabilitarBotoes: () => { if (!gameState.gameRunning) return; const e = { vazio: 0, plantado: 0, pronto: 0 }; gameState.parcelasDeTerra.forEach(p => e[p.estado]++); document.querySelector('[data-action="plantar"]').disabled = gameState.inventario.sementes[gameState.sementeAtivaId] <= 0 || e.vazio === 0; document.querySelector('[data-action="regar"]').disabled = gameState.inventario.agua === 0 || e.plantado === 0; document.querySelector('[data-action="colher"]').disabled = e.pronto === 0; document.querySelector('[data-action="comprarTerra"]').disabled = gameState.moedas < gameState.custoProximaTerra; document.querySelector('[data-action="comprarMelhoria"][data-tipo="click"]').disabled = gameState.moedas < gameState.clickUpgradeCost; document.querySelector('[data-action="comprarMelhoria"][data-tipo="helper"]').disabled = gameState.moedas < gameState.helperCost; if(gameState.mercadoAberto) { Object.keys(INSUMOS).forEach(id => { const btn = document.querySelector(`[data-action="comprarInsumo"][data-id="${id}"]`); if(btn) btn.disabled = gameState.moedas < INSUMOS[id].preco; }); Object.keys(CULTURAS).forEach(id => { const btn = document.querySelector(`[data-action="venderColheita"][data-id="${id}"]`); if(btn) btn.disabled = gameState.inventario.colheita[id] <= 0; }); gameState.lojaCiclica.itens.forEach((item, index) => { const info = EQUIPAMENTOS[item.id]; const btn = document.querySelector(`[data-action="comprarEquipamento"][data-index="${index}"]`); if(btn) btn.disabled = gameState.moedas < info.preco || item.estoque <= 0; }); } }
    };

    // --- INICIALIZAÇÃO E LOOPS DE TEMPO ---
    function iniciarJogo() {
        resetGameState();
        for (let i = 0; i < gameState.numeroParcelas; i++) gameState.parcelasDeTerra.push({ id: i, estado: 'vazio', cultura: null, tempoRestante: 0 });
        logic.simularHistoricoDePrecos();
        gameState.gameRunning = true;
        document.getElementById('story-section').classList.add('hidden');
        document.getElementById('main-game-section').classList.remove('hidden');
        document.getElementById('btn-abrir-pesquisa').classList.remove('hidden');
        logic.atualizarLojaCiclica();
        iniciarLoops();
        render.tudo();
    }

    function iniciarLoops() {
        setInterval(() => { if (!gameState.gameRunning) return; let mudou = false; gameState.parcelasDeTerra.forEach(p => { if (p.estado === 'crescendo' && p.tempoRestante > 0) { p.tempoRestante--; mudou = true; if (p.tempoRestante <= 0) p.estado = 'pronto'; } }); if (gameState.eventoAtivo && gameState.eventoAtivo.tempoRestante > 0) { gameState.eventoAtivo.tempoRestante--; if(gameState.eventoAtivo.tempoRestante <= 0) gameState.eventoAtivo = null; mudou = true; } if(mudou) { render.fazendaStatus(); render.evento(); render.desabilitarBotoes(); } }, 1000);
        setInterval(() => { if (gameState.gameRunning && gameState.helperLevel > 0) for (let i = 0; i < gameState.helperLevel; i++) logic.cicloDeAcaoAutomatica(); }, (5000 / (gameState.helperLevel || 1)) * gameState.bonusVelocidadeAjudante);
        setInterval(() => { if (!gameState.gameRunning) return; logic.verificarEvento(); logic.atualizarPrecos(); gameState.graficoData.labels.push(''); Object.keys(CULTURAS).forEach(id => { gameState.graficoData[id].push(logic.getPrecoDeVenda(id).toFixed(2)); }); if (gameState.graficoData.labels.length > 20) { gameState.graficoData.labels.shift(); Object.keys(CULTURAS).forEach(id => gameState.graficoData[id].shift()); } if(gameState.lojaCiclica.tempoRestante > 0) gameState.lojaCiclica.tempoRestante -= 5; if(gameState.lojaCiclica.tempoRestante <= 0) logic.atualizarLojaCiclica(); render.atualizarGraficos(); if (gameState.mercadoAberto) { render.mercado(); } render.desabilitarBotoes(); }, 5000);
        setInterval(() => { if (!gameState.gameRunning) return; const custo = Math.floor(2 * gameState.numeroParcelas); gameState.moedas -= custo; if (gameState.moedas < 0) gameState.moedas = 0; }, 300000);
    }

    // --- GERENCIADOR DE EVENTOS CENTRAL ---
    const gameEngine = document.getElementById('game-engine');
    
    // Lógica de Arrastar para a Árvore de Pesquisa
    const panzoomContainer = document.getElementById('pesquisa-conteudo');
    panzoomContainer.addEventListener('mousedown', (event) => { if (event.target !== panzoomContainer) return; gameState.isPanning = true; panzoomContainer.classList.add('panning'); gameState.panStart.x = event.clientX - gameState.panOffset.x; gameState.panStart.y = event.clientY - gameState.panOffset.y; });
    window.addEventListener('mousemove', (event) => { if (!gameState.isPanning) return; const x = event.clientX - gameState.panStart.x; const y = event.clientY - gameState.panStart.y; document.getElementById('pesquisa-nodes-container').style.transform = `translate(${x}px, ${y}px)`; document.getElementById('pesquisa-svg-container').style.transform = `translate(${x}px, ${y}px)`; gameState.panOffset = {x, y}; });
    window.addEventListener('mouseup', () => { gameState.isPanning = false; panzoomContainer.classList.remove('panning'); });

    // Lógica de Cliques em Botões
    gameEngine.addEventListener('click', (event) => {
        const target = event.target.closest('button, .node-pesquisa.disponivel');
        if (!target) return;
        const action = target.dataset.action || target.id;
        if (action === 'start-game-btn') { iniciarJogo(); return; }
        if (action === 'btn-abrir-pesquisa' || action === 'btn-fechar-pesquisa') { actions.togglePesquisa(); render.pesquisa(); return; }
        if (!gameState.gameRunning) return;
        if(actions[action]) {
            actions[action](target.dataset.id || target.dataset.tipo, target.dataset.index);
        }
        render.tudo();
    });

    // --- PREPARA O JOGO ---
    resetGameState();
});