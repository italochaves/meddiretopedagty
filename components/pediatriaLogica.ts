// ============================================================
// pediatriaLogica.ts
// Lógica pura de cálculo e validação para prescrições pediátricas.
// Suporte às novas colunas de pediatria_medicamentos.
//
// REGRAS:
// - Não altera banco, não altera fórmulas antigas
// - tabela_por_idade: texto livre — parser básico; se não interpretar,
//   exibe para conferência manual (nunca bloqueia)
// - regra_antigravity: orientação interna, NÃO vai para a receita impressa
// - Se novas colunas vazias: comportamento idêntico ao original
// ============================================================

export interface MedicamentoPediatrico {
    id: number;
    nome: string;
    apresentacao: string;
    via: string;
    regra_calculo: string;
    unidade: string;
    posologia_padrao: string;
    quantidade: string;
    dose_maxima?: number | null;

    // ── Novas colunas de controle (somente leitura) ──────────
    idade_min_meses?: number | null;
    idade_max_meses?: number | null;
    peso_min_kg?: number | null;
    peso_max_kg?: number | null;
    alerta_idade?: string | null;
    alerta_peso?: string | null;
    alerta_vermelho?: string | null;
    cor_alerta?: string | null;
    regra_alerta_meddireto?: string | null;
    tipo_selecao_meddireto?: string | null;
    exige_peso?: string | null;
    peso_usado_para?: string | null;
    exige_idade_anos_meses?: string | null;
    idade_usada_para?: string | null;
    campo_input_idade_anos?: string | null;
    campo_input_idade_meses?: string | null;
    formula_idade_total_meses?: string | null;
    idade_calc_min_total_meses?: number | null;
    idade_calc_max_total_meses?: number | null;
    idade_calc_min_anos?: number | null;
    idade_calc_min_meses?: number | null;
    idade_calc_max_anos?: number | null;
    idade_calc_max_meses?: number | null;
    peso_calc_min_kg?: number | null;
    peso_calc_max_kg?: number | null;
    usar_regra_calculo_original?: string | null;
    tabela_por_idade?: string | null;
    regra_antigravity?: string | null;
}

// ============================================================
// RESULTADO DE VALIDAÇÃO
// ============================================================
export interface ResultadoValidacao {
    permitido: boolean;
    precisaConfirmacao: boolean;
    cor: 'NORMAL' | 'AMARELO' | 'VERMELHO';
    mensagens: string[];
}

// ============================================================
// RESULTADO DE PRESCRIÇÃO GERADA
// ============================================================
export interface ResultadoPrescricao {
    valor: string;               // dose calculada (número formatado ou texto fixo)
    atingiuMaximo: boolean;
    tipoCalculo: string;         // para exibir na UI
    textoManual?: string;        // tabela_por_idade a exibir para conferência
    precisaConferencia?: boolean; // true quando não foi possível calcular automaticamente
    regraInterna?: string;       // regra_antigravity — orientação técnica interna, NÃO imprime na receita
}

// ============================================================
// 1. calcularIdadeTotalMeses
// ============================================================
export function calcularIdadeTotalMeses(
    idadeAnos: string | number | null | undefined,
    idadeMeses: string | number | null | undefined
): number {
    return Number(idadeAnos || 0) * 12 + Number(idadeMeses || 0);
}

// ============================================================
// 2. medicamentoExigeIdade
// ============================================================
export function medicamentoExigeIdade(med: MedicamentoPediatrico): boolean {
    return (
        med.exige_idade_anos_meses === 'SIM' ||
        med.tipo_selecao_meddireto === 'POR_IDADE' ||
        med.idade_min_meses != null ||
        med.idade_max_meses != null ||
        med.idade_calc_min_total_meses != null ||
        med.idade_calc_max_total_meses != null ||
        !!(med.tabela_por_idade && med.tabela_por_idade.trim())
    );
}

// ============================================================
// 3. medicamentoExigePeso
// ============================================================
export function medicamentoExigePeso(med: MedicamentoPediatrico): boolean {
    // Também considera a lógica antiga: se regra_calculo usa '*' ou '/'
    const regraUsaPeso =
        med.regra_calculo &&
        !med.regra_calculo.toUpperCase().includes('FIXO') &&
        (med.regra_calculo.includes('*') || med.regra_calculo.includes('/'));

    return (
        med.exige_peso === 'SIM' ||
        med.tipo_selecao_meddireto === 'POR_PESO' ||
        med.tipo_selecao_meddireto === 'FAIXA_PESO' ||
        med.peso_min_kg != null ||
        med.peso_max_kg != null ||
        med.peso_calc_min_kg != null ||
        med.peso_calc_max_kg != null ||
        !!regraUsaPeso
    );
}

// ============================================================
// DEDUPLICAÇÃO DE MENSAGENS DE ALERTA
// Evita que alerta_idade, alerta_peso e regra_alerta_meddireto
// com conteúdo idêntico apareçam múltiplas vezes.
// ============================================================
function _normalizarMensagem(msg: string): string {
    return String(msg || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function removerAlertasDuplicados(mensagens: string[]): string[] {
    const vistas = new Set<string>();
    const resultado: string[] = [];
    for (const msg of mensagens || []) {
        if (!msg) continue;
        const chave = _normalizarMensagem(msg);
        if (!chave) continue;
        if (!vistas.has(chave)) {
            vistas.add(chave);
            resultado.push(String(msg).trim());
        }
    }
    return resultado;
}

// ============================================================
// 4. validarRestricoesMedicamento
// ============================================================
export function validarRestricoesMedicamento(
    med: MedicamentoPediatrico,
    pesoKg: number | null,
    idadeTotalMeses: number | null
): ResultadoValidacao {
    const mensagens: string[] = [];
    let precisaConfirmacao = false;
    let cor: 'NORMAL' | 'AMARELO' | 'VERMELHO' = 'NORMAL';

    // ── Validações de idade ──────────────────────────────────
    if (idadeTotalMeses !== null) {
        if (med.idade_min_meses != null && idadeTotalMeses < med.idade_min_meses) {
            mensagens.push(
                med.alerta_idade ||
                med.regra_alerta_meddireto ||
                `Idade abaixo da mínima permitida (${med.idade_min_meses} meses) para esta medicação.`
            );
            precisaConfirmacao = true;
            cor = 'VERMELHO';
        }

        if (med.idade_max_meses != null && idadeTotalMeses > med.idade_max_meses) {
            mensagens.push(
                med.alerta_idade ||
                med.regra_alerta_meddireto ||
                `Idade acima da máxima permitida (${med.idade_max_meses} meses) para esta medicação.`
            );
            precisaConfirmacao = true;
            cor = 'VERMELHO';
        }

        if (med.idade_calc_min_total_meses != null && idadeTotalMeses < med.idade_calc_min_total_meses) {
            mensagens.push(
                med.alerta_idade ||
                med.regra_alerta_meddireto ||
                `Idade abaixo do intervalo de cálculo (${med.idade_calc_min_total_meses} meses).`
            );
            precisaConfirmacao = true;
            if (cor !== 'VERMELHO') cor = med.cor_alerta === 'AMARELO' ? 'AMARELO' : 'VERMELHO';
        }

        if (med.idade_calc_max_total_meses != null && idadeTotalMeses > med.idade_calc_max_total_meses) {
            mensagens.push(
                med.alerta_idade ||
                med.regra_alerta_meddireto ||
                `Idade acima do intervalo de cálculo (${med.idade_calc_max_total_meses} meses).`
            );
            precisaConfirmacao = true;
            if (cor !== 'VERMELHO') cor = med.cor_alerta === 'AMARELO' ? 'AMARELO' : 'VERMELHO';
        }
    }

    // ── Validações de peso ───────────────────────────────────
    if (pesoKg !== null) {
        if (med.peso_min_kg != null && pesoKg < med.peso_min_kg) {
            mensagens.push(
                med.alerta_peso ||
                med.regra_alerta_meddireto ||
                `Peso abaixo do mínimo permitido (${med.peso_min_kg} kg) para esta medicação.`
            );
            precisaConfirmacao = true;
            cor = 'VERMELHO';
        }

        if (med.peso_max_kg != null && pesoKg > med.peso_max_kg) {
            mensagens.push(
                med.alerta_peso ||
                med.regra_alerta_meddireto ||
                `Peso acima do máximo permitido (${med.peso_max_kg} kg) para esta medicação.`
            );
            precisaConfirmacao = true;
            cor = 'VERMELHO';
        }

        if (med.peso_calc_min_kg != null && pesoKg < med.peso_calc_min_kg) {
            mensagens.push(
                med.alerta_peso ||
                med.regra_alerta_meddireto ||
                `Peso abaixo do intervalo de cálculo (${med.peso_calc_min_kg} kg).`
            );
            precisaConfirmacao = true;
            if (cor !== 'VERMELHO') cor = med.cor_alerta === 'AMARELO' ? 'AMARELO' : 'VERMELHO';
        }

        if (med.peso_calc_max_kg != null && pesoKg > med.peso_calc_max_kg) {
            mensagens.push(
                med.alerta_peso ||
                med.regra_alerta_meddireto ||
                `Peso acima do intervalo de cálculo (${med.peso_calc_max_kg} kg).`
            );
            precisaConfirmacao = true;
            if (cor !== 'VERMELHO') cor = med.cor_alerta === 'AMARELO' ? 'AMARELO' : 'VERMELHO';
        }
    }

    // ── Força alerta vermelho se coluna marcada ──────────────
    if (med.alerta_vermelho === 'SIM' && mensagens.length > 0) {
        precisaConfirmacao = true;
        cor = 'VERMELHO';
    }

    // ── Aplica cor_alerta se não houver vermelho ─────────────
    if (mensagens.length > 0 && cor === 'NORMAL' && med.cor_alerta === 'AMARELO') {
        cor = 'AMARELO';
    }

    // Deduplica mensagens antes de retornar
    // (evita repetição quando alerta_idade === regra_alerta_meddireto, etc.)
    const mensagensUnicas = removerAlertasDuplicados(mensagens);

    return {
        permitido: true, // nunca bloqueia automaticamente — apenas pede confirmação
        precisaConfirmacao,
        cor,
        mensagens: mensagensUnicas,
    };
}

// ============================================================
// 5. definirTipoCalculo
// ============================================================
export type TipoCalculo = 'POR_PESO' | 'POR_IDADE' | 'DOSE_FIXA' | 'FAIXA_PESO' | 'PADRAO_ATUAL';

export function definirTipoCalculo(med: MedicamentoPediatrico): TipoCalculo {
    const tipo = (med.tipo_selecao_meddireto || '').toUpperCase().trim();
    if (tipo === 'POR_PESO') return 'POR_PESO';
    if (tipo === 'POR_IDADE') return 'POR_IDADE';
    if (tipo === 'DOSE_FIXA') return 'DOSE_FIXA';
    if (tipo === 'FAIXA_PESO') return 'FAIXA_PESO';
    return 'PADRAO_ATUAL';
}

// ============================================================
// 6. Motor antigo — preservado integralmente
// ============================================================
function _calcularDoseAntiga(
    pesoKg: number,
    med: MedicamentoPediatrico
): { valor: string; atingiuMaximo: boolean } {
    const regra = med.regra_calculo.toUpperCase();

    if (regra.includes('FIXO')) {
        const valorFixo = med.regra_calculo.split(':')[1]?.trim() || '1';
        return { valor: valorFixo, atingiuMaximo: false };
    }

    let doseCalculada = 0;
    let atingiuMaximo = false;

    if (regra.includes('*')) {
        const fator = parseFloat(regra.split('*')[1].trim());
        doseCalculada = pesoKg * fator;
    } else if (regra.includes('/')) {
        const divisor = parseFloat(regra.split('/')[1].trim());
        doseCalculada = pesoKg / divisor;
    }

    if (med.dose_maxima && doseCalculada > med.dose_maxima) {
        doseCalculada = med.dose_maxima;
        atingiuMaximo = true;
    }

    let doseFormatada = '';
    const unidadeLower = med.unidade.toLowerCase();
    if (unidadeLower === 'gotas') {
        doseFormatada = Math.round(doseCalculada).toString();
    } else if (unidadeLower === 'ml') {
        doseFormatada = doseCalculada.toFixed(1).replace('.', ',');
    } else if (unidadeLower.includes('comprimido')) {
        const rounded = Math.round(doseCalculada * 2) / 2;
        doseFormatada = rounded.toString().replace('.', ',');
    } else {
        doseFormatada = doseCalculada.toString().replace('.', ',');
    }

    return { valor: doseFormatada, atingiuMaximo };
}

// ============================================================
// 7. Parser básico de tabela_por_idade (texto livre)
// Apenas padrões claros e seguros. Se não encontrar → conferência manual.
// NÃO criar parser rígido neste momento.
// ============================================================
function _tentarParsearTabelaIdade(tabela: string, idadeTotalMeses: number): string | null {
    try {
        const linhas = tabela.split(/[\n;|]+/).map(l => l.trim()).filter(Boolean);

        for (const linha of linhas) {
            // Padrão: "X-Y meses: dose" ou "X a Y meses: dose"
            const m1 = linha.match(/^(\d+)\s*(?:-|a|até)\s*(\d+)\s*meses?\s*[:\-–]\s*(.+)/i);
            if (m1) {
                const min = parseInt(m1[1], 10);
                const max = parseInt(m1[2], 10);
                if (idadeTotalMeses >= min && idadeTotalMeses <= max) return m1[3].trim();
                continue;
            }

            // Padrão: "X-Y anos: dose" ou "X a Y anos: dose"
            const m2 = linha.match(/^(\d+)\s*(?:-|a|até)\s*(\d+)\s*anos?\s*[:\-–]\s*(.+)/i);
            if (m2) {
                const minM = parseInt(m2[1], 10) * 12;
                const maxM = parseInt(m2[2], 10) * 12 + 11;
                if (idadeTotalMeses >= minM && idadeTotalMeses <= maxM) return m2[3].trim();
                continue;
            }

            // Padrão: "< X meses: dose" ou "até X meses: dose"
            const m3 = linha.match(/^(?:<|até|menor\s*de)\s*(\d+)\s*meses?\s*[:\-–]\s*(.+)/i);
            if (m3) {
                if (idadeTotalMeses < parseInt(m3[1], 10)) return m3[2].trim();
                continue;
            }

            // Padrão: "< X anos: dose"
            const m4 = linha.match(/^(?:<|até|menor\s*de)\s*(\d+)\s*anos?\s*[:\-–]\s*(.+)/i);
            if (m4) {
                if (idadeTotalMeses < parseInt(m4[1], 10) * 12) return m4[2].trim();
                continue;
            }

            // Padrão: "> X meses: dose" ou "acima de X meses"
            const m5 = linha.match(/^(?:>|acima\s*de|maior\s*de)\s*(\d+)\s*meses?\s*[:\-–]\s*(.+)/i);
            if (m5) {
                if (idadeTotalMeses > parseInt(m5[1], 10)) return m5[2].trim();
                continue;
            }

            // Padrão: "> X anos: dose"
            const m6 = linha.match(/^(?:>|acima\s*de|maior\s*de)\s*(\d+)\s*anos?\s*[:\-–]\s*(.+)/i);
            if (m6) {
                if (idadeTotalMeses > parseInt(m6[1], 10) * 12) return m6[2].trim();
                continue;
            }
        }
        return null; // não conseguiu interpretar
    } catch {
        return null;
    }
}

// ============================================================
// 8. gerarPrescricaoPorPeso — usa motor antigo (preservado)
// ============================================================
export function gerarPrescricaoPorPeso(
    med: MedicamentoPediatrico,
    pesoKg: number
): ResultadoPrescricao {
    const resultado = _calcularDoseAntiga(pesoKg, med);
    return {
        valor: resultado.valor,
        atingiuMaximo: resultado.atingiuMaximo,
        tipoCalculo: 'POR_PESO',
        regraInterna: med.regra_antigravity || undefined,
    };
}

// ============================================================
// 9. gerarPrescricaoPorIdade
// - tabela_por_idade: tenta parser básico; se não interpretar, exibe para conferência manual
// - regra_antigravity: orientação interna — retorna como regraInterna (não imprime na receita)
// - usar_regra_calculo_original = NÃO: ignora peso, usa apenas lógica por idade
// ============================================================
export function gerarPrescricaoPorIdade(
    med: MedicamentoPediatrico,
    idadeTotalMeses: number
): ResultadoPrescricao {
    const regraInterna = med.regra_antigravity?.trim() || undefined;

    // Tenta interpretar tabela_por_idade com parser básico
    if (med.tabela_por_idade && med.tabela_por_idade.trim()) {
        const dose = _tentarParsearTabelaIdade(med.tabela_por_idade, idadeTotalMeses);

        if (dose) {
            // Conseguiu identificar a faixa — usa automaticamente
            return {
                valor: dose,
                atingiuMaximo: false,
                tipoCalculo: 'POR_IDADE (tabela)',
                regraInterna,
            };
        }

        // Não conseguiu interpretar automaticamente — exibe para conferência manual
        // NUNCA bloqueia a prescrição
        return {
            valor: '[conferir tabela por idade]',
            atingiuMaximo: false,
            tipoCalculo: 'POR_IDADE',
            textoManual: med.tabela_por_idade,
            precisaConferencia: true,
            regraInterna,
        };
    }

    // Sem tabela_por_idade — exibe para conferência manual
    return {
        valor: '[dose por idade — conferir manualmente]',
        atingiuMaximo: false,
        tipoCalculo: 'POR_IDADE',
        precisaConferencia: true,
        regraInterna,
    };
}

// ============================================================
// 10. gerarPrescricaoDoseFixa
// ============================================================
export function gerarPrescricaoDoseFixa(med: MedicamentoPediatrico): ResultadoPrescricao {
    const regra = med.regra_calculo.toUpperCase();
    if (regra.includes('FIXO')) {
        const valorFixo = med.regra_calculo.split(':')[1]?.trim() || '1';
        return {
            valor: valorFixo,
            atingiuMaximo: false,
            tipoCalculo: 'DOSE_FIXA',
            regraInterna: med.regra_antigravity || undefined,
        };
    }
    return {
        valor: '(dose fixa — conferir)',
        atingiuMaximo: false,
        tipoCalculo: 'DOSE_FIXA',
        regraInterna: med.regra_antigravity || undefined,
    };
}

// ============================================================
// 11. gerarPrescricaoPorFaixaPeso
// Tenta parser básico em tabela_por_idade (reutilizado para faixas de peso)
// ============================================================
function _tentarParsearFaixaPeso(tabela: string, pesoKg: number): string | null {
    try {
        const linhas = tabela.split(/[\n;|]+/).map(l => l.trim()).filter(Boolean);
        for (const linha of linhas) {
            const m1 = linha.match(/^(\d+(?:[.,]\d+)?)\s*(?:-|a|até)\s*(\d+(?:[.,]\d+)?)\s*kg?\s*[:\-–]\s*(.+)/i);
            if (m1) {
                const min = parseFloat(m1[1].replace(',', '.'));
                const max = parseFloat(m1[2].replace(',', '.'));
                if (pesoKg >= min && pesoKg <= max) return m1[3].trim();
                continue;
            }
            const m2 = linha.match(/^(?:<|até|menor\s*de)\s*(\d+(?:[.,]\d+)?)\s*kg?\s*[:\-–]\s*(.+)/i);
            if (m2) {
                if (pesoKg < parseFloat(m2[1].replace(',', '.'))) return m2[2].trim();
                continue;
            }
            const m3 = linha.match(/^(?:>|acima\s*de|maior\s*de)\s*(\d+(?:[.,]\d+)?)\s*kg?\s*[:\-–]\s*(.+)/i);
            if (m3) {
                if (pesoKg > parseFloat(m3[1].replace(',', '.'))) return m3[2].trim();
                continue;
            }
        }
        return null;
    } catch {
        return null;
    }
}

export function gerarPrescricaoPorFaixaPeso(
    med: MedicamentoPediatrico,
    pesoKg: number
): ResultadoPrescricao {
    const regraInterna = med.regra_antigravity?.trim() || undefined;

    if (med.tabela_por_idade && med.tabela_por_idade.trim()) {
        const dose = _tentarParsearFaixaPeso(med.tabela_por_idade, pesoKg);
        if (dose) {
            return { valor: dose, atingiuMaximo: false, tipoCalculo: 'FAIXA_PESO', regraInterna };
        }
        return {
            valor: '[conferir faixa de peso]',
            atingiuMaximo: false,
            tipoCalculo: 'FAIXA_PESO',
            textoManual: med.tabela_por_idade,
            precisaConferencia: true,
            regraInterna,
        };
    }

    // Fallback: motor antigo por peso
    const resultado = _calcularDoseAntiga(pesoKg, med);
    return { ...resultado, tipoCalculo: 'FAIXA_PESO (cálculo por peso)', regraInterna };
}

// ============================================================
// 12. gerarPrescricaoPadraoAtual — fallback 100% idêntico ao original
// ============================================================
export function gerarPrescricaoPadraoAtual(
    med: MedicamentoPediatrico,
    pesoKg: number
): ResultadoPrescricao {
    const resultado = _calcularDoseAntiga(pesoKg, med);
    return { ...resultado, tipoCalculo: 'PADRAO_ATUAL' };
}

// ============================================================
// 13. montarPrescricaoFinal — orquestrador principal
// ============================================================
export function montarPrescricaoFinal(
    med: MedicamentoPediatrico,
    pesoKg: number | null,
    idadeAnos: string | number | null,
    idadeMeses: string | number | null
): ResultadoPrescricao {
    const exigeIdade = medicamentoExigeIdade(med);
    const tipo = definirTipoCalculo(med);
    const ignorarPeso = med.usar_regra_calculo_original === 'NÃO';

    const idadeTotalMeses = exigeIdade
        ? calcularIdadeTotalMeses(idadeAnos, idadeMeses)
        : 0;

    if (tipo === 'POR_PESO') {
        return gerarPrescricaoPorPeso(med, pesoKg ?? 0);
    }

    if (tipo === 'POR_IDADE') {
        if (ignorarPeso) {
            return gerarPrescricaoPorIdade(med, idadeTotalMeses);
        }
        // Tenta por idade; se precisar de conferência e tiver peso, usa peso como fallback
        const tentativa = gerarPrescricaoPorIdade(med, idadeTotalMeses);
        if (tentativa.precisaConferencia && pesoKg && pesoKg > 0) {
            return gerarPrescricaoPorPeso(med, pesoKg);
        }
        return tentativa;
    }

    if (tipo === 'DOSE_FIXA') {
        return gerarPrescricaoDoseFixa(med);
    }

    if (tipo === 'FAIXA_PESO') {
        return gerarPrescricaoPorFaixaPeso(med, pesoKg ?? 0);
    }

    // PADRAO_ATUAL — comportamento 100% idêntico ao original
    return gerarPrescricaoPadraoAtual(med, pesoKg ?? 0);
}

// ============================================================
// 14. Helpers de UI
// ============================================================

export function getLabelTipoCalculo(med: MedicamentoPediatrico): string {
    const tipo = (med.tipo_selecao_meddireto || '').toUpperCase().trim();
    if (tipo === 'POR_PESO') return 'PESO';
    if (tipo === 'POR_IDADE') return 'IDADE';
    if (tipo === 'DOSE_FIXA') return 'FIXO';
    if (tipo === 'FAIXA_PESO') return 'FAIXA';
    return '';
}

export function getCorBadgeTipo(med: MedicamentoPediatrico): string {
    const tipo = (med.tipo_selecao_meddireto || '').toUpperCase().trim();
    if (tipo === 'POR_PESO') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (tipo === 'POR_IDADE') return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
    if (tipo === 'DOSE_FIXA') return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    if (tipo === 'FAIXA_PESO') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    return '';
}
