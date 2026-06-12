const fs = require('fs');
const path = require('path');

// IMPORTANTE: O CSV do DATASUS está em ISO-8859-1 (Latin-1), NÃO em UTF-8.
// Usar 'latin1' garante que ó, ã, ç, é, etc. sejam lidos corretamente.
const csvPath = path.join(__dirname, 'node_modules', 'cid10-br-mcp', 'data', 'CID-10-SUBCATEGORIAS.CSV');
const outputPath = path.join(__dirname, 'public', 'cid10.json');

const content = fs.readFileSync(csvPath, 'latin1'); // <- CRÍTICO: Latin-1, não utf-8
const lines = content.split('\n');
const results = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Colunas do DATASUS CSV: SUBCAT;CLASSIF;RESTRSEXO;CAUSAOBITO;DESCRICAO;DESCRABREV;REFER;EXCLUIDOS
  const parts = line.split(';');
  const codigo = parts[0];
  const nome = parts[4] || parts[1]; // DESCRICAO está no índice 4

  if (codigo && nome) {
    results.push({
      codigo: codigo.trim(),
      nome: nome.trim()
    });
  }
}

// Ordenar por código
results.sort((a, b) => a.codigo.localeCompare(b.codigo));

// Validação: garantir que nenhum registro tenha o caractere de replacement U+FFFD (?)
const broken = results.filter(r => r.nome.includes('\uFFFD'));
if (broken.length > 0) {
  console.error(`\u274C ATENÇÃO: ${broken.length} registros com caracteres quebrados (U+FFFD)!`);
  broken.slice(0, 5).forEach(r => console.error(`  ${r.codigo}: ${r.nome}`));
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\u2705 cid10.json gerado com sucesso em UTF-8!`);
console.log(`Total de CIDs extraídos: ${results.length}`);
console.log(`Amostra - A000: ${results.find(r => r.codigo === 'A000')?.nome}`);
console.log(`Amostra - A009: ${results.find(r => r.codigo === 'A009')?.nome}`);
