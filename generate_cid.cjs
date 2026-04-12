const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'node_modules', 'cid10-br-mcp', 'data', 'CID-10-SUBCATEGORIAS.CSV');
const outputPath = path.join(__dirname, 'public', 'cid10.json');

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');
const results = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // As colunas no DATASUS CSV geralmente são separadas por ';'
  const parts = line.split(';');
  const codigo = parts[0];
  const nome = parts[4] || parts[1]; // fallback apenas para garantir
  
  if (codigo && nome) {
    results.push({
       codigo: codigo.trim(),
       nome: nome.trim()
    });
  }
}

// Optionally sort
results.sort((a,b) => a.codigo.localeCompare(b.codigo));

fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
console.log('Total de Subcategorias CIDs extraídas: ' + results.length);
