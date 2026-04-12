import { createReadStream } from 'node:fs';

class CidRecord {
  /**
   * Construtor padrão para leitura de linha das tabelas CSV da CID-10
   *
   * Realiza a separação inicial das colunas delimitadas por ponto e vírgula e
   * armazena a sequência em {@link $columns | `$columns`} como texto puro.
   *
   * @param row Linha com colunas delimitadas por ponto e vírgula
   */
  constructor(row) {
    this.$columns = row.split(";");
  }
}
Object.defineProperties(CidRecord.prototype, {
  $columns: { enumerable: false, writable: true }
});
const _Cid10Chapter = class _Cid10Chapter extends CidRecord {
  /**
   * Obtém o número do capítulo da sequência de valores
   * {@link $columns | `$columns`}
   * 
   * Numeração arábica; se igual a zero, indica o capítulo que contém os códigos
   * não oficialmente pertinentes à CID-10.
   */
  get number() {
    return parseInt(this.$columns[_Cid10Chapter.NUMBER]);
  }
  /**
   * Extrai o número do capítulo em algarismo romano da sequência de valores
   * {@link $columns | `$columns`}
   * 
   * Este valor não possui coluna específica e é extraído a partir do prefixo
   * da coluna "DESCRABREV", podendo ser `undefined`.
   */
  get roman() {
    var _a;
    return (_a = this.$columns[_Cid10Chapter.ABBREVIATION].match(/^([IVXLCDM]+)\.\s*/)) == null ? void 0 : _a[1];
  }
  /**
   * Obtém o código da primeira categoria do capítulo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catFirst() {
    return this.$columns[_Cid10Chapter.CAT_FIRST];
  }
  /**
   * Obtém o código da última categoria do capítulo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catLast() {
    return this.$columns[_Cid10Chapter.CAT_LAST];
  }
  /**
   * Obtém a descrição (nome) do capítulo, sem prefixo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_Cid10Chapter.DESCRIPTION].replace(/^Capítulo\s+[IVXLCDM]+\s*-\s*/, "");
  }
  /**
   * Obtém a descrição (nome) abreviado do capítulo, com até 50 caracteres, sem
   * prefixo, a partir da sequência de valores {@link $columns | `$columns`}
   */
  get abbreviation() {
    return this.$columns[_Cid10Chapter.ABBREVIATION].replace(/^[IVXLCDM]+\.\s*/, "");
  }
};
/**
 * Índice da coluna: "NUMCAP"
 */
_Cid10Chapter.NUMBER = 0;
/**
 * Índice da coluna: "CATINIC"
 */
_Cid10Chapter.CAT_FIRST = 1;
/**
 * Índice da coluna: "CATFIM"
 */
_Cid10Chapter.CAT_LAST = 2;
/**
 * Índice da coluna: "DESCRICAO"
 */
_Cid10Chapter.DESCRIPTION = 3;
/**
 * Índice da coluna: "DESCRABREV"
 */
_Cid10Chapter.ABBREVIATION = 4;
let Cid10Chapter = _Cid10Chapter;
Object.defineProperties(Cid10Chapter.prototype, {
  number: { enumerable: true },
  roman: { enumerable: true },
  catFirst: { enumerable: true },
  catLast: { enumerable: true },
  description: { enumerable: true },
  abbreviation: { enumerable: true }
});
function cid10ChaptersStream(path, highWaterMark) {
  return cidTableStream(path, Cid10Chapter, highWaterMark);
}
const _Cid10Group = class _Cid10Group extends CidRecord {
  /**
   * Obtém o código da primeira categoria do grupo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catFirst() {
    return this.$columns[_Cid10Group.CAT_FIRST];
  }
  /**
   * Obtém o código da última categoria do grupo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catLast() {
    return this.$columns[_Cid10Group.CAT_LAST];
  }
  /**
   * Obtém a descrição (nome) do grupo, a partir da sequência de valores
   * {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_Cid10Group.DESCRIPTION];
  }
  /**
   * Obtém a descrição (nome) abreviado do grupo, com até 50 caracteres, a
   * partir da sequência de valores {@link $columns | `$columns`}
   */
  get abbreviation() {
    return this.$columns[_Cid10Group.ABBREVIATION];
  }
};
/**
 * Índice da coluna "CATINIC"
 */
_Cid10Group.CAT_FIRST = 0;
/**
 * Índice da coluna "CATFIM"
 */
_Cid10Group.CAT_LAST = 1;
/**
 * Índice da coluna "DESCRICAO"
 */
_Cid10Group.DESCRIPTION = 2;
/**
 * Índice da coluna "DESCRABREV"
 */
_Cid10Group.ABBREVIATION = 3;
let Cid10Group = _Cid10Group;
Object.defineProperties(Cid10Group.prototype, {
  catFirst: { enumerable: true },
  catLast: { enumerable: true },
  description: { enumerable: true },
  abbreviation: { enumerable: true }
});
function cid10GroupsStream(path, highWaterMark) {
  return cidTableStream(path, Cid10Group, highWaterMark);
}
const _Cid10Category = class _Cid10Category extends CidRecord {
  /**
   * Obtém o código da categoria da sequência de valores
   * {@link $columns | `$columns`}
   */
  get code() {
    return this.$columns[_Cid10Category.CODE];
  }
  /**
   * Obtém a indicação se a situação da categoria em relação à classificação
   * cruz/asterisco da sequência de valores {@link $columns | `$columns`}:
   * 
   * - `undefined`: não tem dupla classificação;
   * - `'+'`: classificação por etiologia; e
   * - `'*'`: classificação por manifestação.
   */
  get classif() {
    return this.$columns[_Cid10Category.CLASSIF] || void 0;
  }
  /**
   * Obtém a descrição (nome) da categoria da sequência de valores
   * {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_Cid10Category.DESCRIPTION];
  }
  /**
   * Obtém a descrição (nome) abreviado da categoria, com até 50 caracteres,
   * a partir da sequência de valores {@link $columns | `$columns`}
   */
  get abbreviation() {
    return this.$columns[_Cid10Category.ABBREVIATION].replace(/^[A-Z]\d+\s+/, "");
  }
  /**
   * Obtém, quando a categoria tiver dupla classificação, o código da categoria
   * segundo a outra classificação, a partir da sequência de valores
   * {@link $columns | `$columns`}
   *
   * Nem todos os casos de dupla classificação contém este campo.
   */
  get refer() {
    return this.$columns[_Cid10Category.REFER] || void 0;
  }
  /**
   * Obtém lista com o(s) código(s) de categorias excluídas que agora fazem
   * parte desta categoria, a partir da sequência de valores
   * {@link $columns | `$columns`}
   */
  get excluded() {
    var _a;
    return ((_a = this.$columns[_Cid10Category.EXCLUDED] || void 0) == null ? void 0 : _a.split(",")) || [];
  }
};
/**
 * Índice da coluna "CAT"
 */
_Cid10Category.CODE = 0;
/**
 * Índice da coluna "CLASSIF"
 */
_Cid10Category.CLASSIF = 1;
/**
 * Índice da coluna "DESCRICAO"
 */
_Cid10Category.DESCRIPTION = 2;
/**
 * Índice da coluna "DESCRABREV"
 */
_Cid10Category.ABBREVIATION = 3;
/**
 * Índice da coluna "REFER"
 */
_Cid10Category.REFER = 4;
/**
 * Índice da coluna "EXCLUIDOS"
 */
_Cid10Category.EXCLUDED = 5;
let Cid10Category = _Cid10Category;
Object.defineProperties(Cid10Category.prototype, {
  code: { enumerable: true },
  classif: { enumerable: true },
  description: { enumerable: true },
  abbreviation: { enumerable: true },
  refer: { enumerable: true },
  excluded: { enumerable: true }
});
function cid10CategoriesStream(path, highWaterMark) {
  return cidTableStream(path, Cid10Category, highWaterMark);
}
const _Cid10Subcategory = class _Cid10Subcategory extends CidRecord {
  /**
   * Obtém o código da subcategoria (sem incluir ponto) a partir da sequência de
   * valores {@link $columns | `$columns`}
   *
   * Para categorias sem subcategorias, o quarto caractere está em branco.
   */
  get code() {
    return this.$columns[_Cid10Subcategory.CODE];
  }
  /**
   * Obtém indicação se a situação da subcategoria em relação à classificação
   * cruz/asterisco, a partir da sequência de valores
   * {@link $columns | `$columns`}:
   *
   * - `undefined`: não tem dupla classificação;
   * - `'+'`: classificação por etiologia; e
   * - `'*'`: classificação por manifestação.
   */
  get classif() {
    return this.$columns[_Cid10Subcategory.CLASSIF] || void 0;
  }
  /**
   * Obtém indicação se a subcategoria só pode ser usada para homens ou
   * mulheres, a partir da sequência de valores {@link $columns | `$columns`}:
   *
   * - `undefined`: pode ser utilizada em qualquer situação;
   * - `'F'`: só deve ser utilizada para o sexo feminino; e
   * - `'M'`: só deve ser utilizada para o sexo masculino.
   */
  get restrBySex() {
    return this.$columns[_Cid10Subcategory.RESTR_BY_SEX] || void 0;
  }
  /**
   * Obtém indicação se a subcategoria pode causar óbito, a partir da sequência
   * de valores {@link $columns | `$columns`}:
   *
   * - `undefined`: não há restrição; e
   * - `'N'`: a subcategoria tem pouca probabilidade de causar óbito.
   *
   * Além disto, deve-se atentar para o fato de que as subcategorias da
   * classificação asterisco não devem ser utilizadas na classificação de causas
   * de óbitos, assim como as subcategorias do capítulo XIX e do capítulo XXI.
   */
  get canCauseDeath() {
    return this.$columns[_Cid10Subcategory.CAN_CAUSE_DEATH] || void 0;
  }
  /**
   * Obtém a descrição (nome) da subcategoria da sequência de valores
   * {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_Cid10Subcategory.DESCRIPTION];
  }
  /**
   * Obtém a descrição (nome) abreviado da subcategoria, com até 50 caracteres,
   * a partir da sequência de valores {@link $columns | `$columns`}
   */
  get abbreviation() {
    return this.$columns[_Cid10Subcategory.ABBREVIATION].replace(/^[A-Z]\d+(\.\d+)?\s+/, "");
  }
  /**
   * Obtém, quando a subcategoria tiver dupla classificação, o código da
   * subcategoria segundo a outra classificação, a partir da sequência de
   * valores {@link $columns | `$columns`}
   * 
   * Nem todos os casos de dupla classificação contém este campo.
   */
  get refer() {
    return this.$columns[_Cid10Subcategory.REFER] || void 0;
  }
  /**
   * Obtém uma lista com o(s) código(s) de subcategorias excluídas que agora
   * fazem parte desta subcategoria, a partid da sequência de valores
   * {@link $columns | `$columns`}
   */
  get excluded() {
    var _a;
    return ((_a = this.$columns[_Cid10Subcategory.EXCLUDED] || void 0) == null ? void 0 : _a.split(",")) || [];
  }
};
/**
 * Índice da coluna "SUBCAT"
 */
_Cid10Subcategory.CODE = 0;
/**
 * Índice da coluna "CLASSIF"
 */
_Cid10Subcategory.CLASSIF = 1;
/**
 * Índice da coluna "RESTRSEXO"
 */
_Cid10Subcategory.RESTR_BY_SEX = 2;
/**
 * Índice da coluna "CAUSAOBITO"
 */
_Cid10Subcategory.CAN_CAUSE_DEATH = 3;
/**
 * Índice da coluna "DESCRICAO"
 */
_Cid10Subcategory.DESCRIPTION = 4;
/**
 * Índice da coluna "DESCRABREV"
 */
_Cid10Subcategory.ABBREVIATION = 5;
/**
 * Índice da coluna "REFER"
 */
_Cid10Subcategory.REFER = 6;
/**
 * Índice da coluna "EXCLUIDOS"
 */
_Cid10Subcategory.EXCLUDED = 7;
let Cid10Subcategory = _Cid10Subcategory;
Object.defineProperties(Cid10Subcategory.prototype, {
  code: { enumerable: true },
  classif: { enumerable: true },
  restrBySex: { enumerable: true },
  canCauseDeath: { enumerable: true },
  description: { enumerable: true },
  abbreviation: { enumerable: true },
  refer: { enumerable: true },
  excluded: { enumerable: true }
});
function cid10SubcategoriesStream(path, highWaterMark) {
  return cidTableStream(path, Cid10Subcategory, highWaterMark);
}
const _CidOGroup = class _CidOGroup extends CidRecord {
  /**
   * Obtém o código da primeira categoria do grupo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catFirst() {
    return this.$columns[_CidOGroup.CAT_FIRST];
  }
  /**
   * Obtém o código da última categoria do grupo, a partir da sequência de
   * valores {@link $columns | `$columns`}
   */
  get catLast() {
    return this.$columns[_CidOGroup.CAT_LAST];
  }
  /**
   * Obtém a descrição (nome) do grupo, a partir da sequência de valores
   * {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_CidOGroup.DESCRIPTION];
  }
  /**
   * Obtém a referência do grupo na classificação do capítulo II da CID-10
   * (Neoplasias), a partir da sequência de valores
   * {@link $columns | `$columns`}, podendo ser `undefined`
   */
  get refer() {
    return this.$columns[_CidOGroup.REFER] || void 0;
  }
};
/**
 * Índice da coluna "CATINIC"
 */
_CidOGroup.CAT_FIRST = 0;
/**
 * Índice da coluna "CATFIM"
 */
_CidOGroup.CAT_LAST = 1;
/**
 * Índice da coluna "DESCRICAO"
 */
_CidOGroup.DESCRIPTION = 2;
/**
 * Índice da coluna "REFER"
 */
_CidOGroup.REFER = 3;
let CidOGroup = _CidOGroup;
Object.defineProperties(CidOGroup.prototype, {
  catFirst: { enumerable: true },
  catLast: { enumerable: true },
  description: { enumerable: true },
  refer: { enumerable: true }
});
function cidOGroupsStream(path, highWaterMark) {
  return cidTableStream(path, CidOGroup, highWaterMark);
}
const _CidOCategory = class _CidOCategory extends CidRecord {
  /**
   * Obtém o código da categoria da sequência de valores
   * {@link $columns | `$columns`}
   */
  get code() {
    return this.$columns[_CidOCategory.CODE];
  }
  /**
   * Obtém a descrição (nome) da categoria da sequência de valores
   * {@link $columns | `$columns`}
   */
  get description() {
    return this.$columns[_CidOCategory.DESCRIPTION];
  }
  /**
   * Obtém a referência da categoria na classificação do capítulo II da CID-10
   * (Neoplasias), a partir da sequência de valores
   * {@link $columns | `$columns`}
   */
  get refer() {
    return this.$columns[_CidOCategory.REFER] || void 0;
  }
};
/**
 * Índice da coluna "CAT"
 */
_CidOCategory.CODE = 0;
/**
 * Índice da coluna "DESCRICAO"
 */
_CidOCategory.DESCRIPTION = 1;
/**
 * Índice da coluna "REFER"
 */
_CidOCategory.REFER = 2;
let CidOCategory = _CidOCategory;
Object.defineProperties(CidOCategory.prototype, {
  code: { enumerable: true },
  description: { enumerable: true },
  refer: { enumerable: true }
});
function cidOCategoriesStream(path, highWaterMark) {
  return cidTableStream(path, CidOCategory, highWaterMark);
}
async function* cidTableStream(path, Factory = CidRecord, highWaterMark) {
  const encoding = "latin1";
  const LINEBRK = ";\r\n";
  const SKIPERR = Symbol();
  let streamError, streamEnd = false, buffer = "", rowsQueue = [], breakLoop = false;
  const read = (chunk) => {
    buffer += chunk;
    const end = buffer.lastIndexOf(LINEBRK);
    if (end >= 0) {
      let completeRows = buffer.slice(0, end);
      buffer = buffer.slice(end + LINEBRK.length);
      rowsQueue.push(completeRows);
    }
  };
  createReadStream(path, { encoding, highWaterMark }).on("data", read).on("end", () => {
    streamEnd = true;
  }).on("error", (err) => {
    streamError = err;
  });
  const nextRowsQueue = (resolve, reject) => {
    if (streamError) {
      reject(streamError);
    } else if (rowsQueue.length > 0) {
      const queue = rowsQueue;
      rowsQueue = [];
      breakLoop = buffer.length === 0 && streamEnd;
      resolve(queue);
    } else if (!streamEnd) {
      setImmediate(() => nextRowsQueue(resolve, reject));
    } else {
      reject(SKIPERR);
    }
  };
  try {
    let completeRows, row, skip = true;
    while (!breakLoop && !streamError) {
      for (completeRows of await new Promise(nextRowsQueue)) {
        for (row of completeRows.split(LINEBRK)) {
          if (!skip) {
            yield new Factory(row);
          } else {
            skip = false;
          }
        }
      }
    }
  } catch (loopError) {
    if (loopError !== SKIPERR) {
      throw loopError;
    }
  }
  if (streamError) {
    throw streamError;
  }
}

export { Cid10Category, Cid10Chapter, Cid10Group, Cid10Subcategory, CidOCategory, CidOGroup, CidRecord, cid10CategoriesStream, cid10ChaptersStream, cid10GroupsStream, cid10SubcategoriesStream, cidOCategoriesStream, cidOGroupsStream, cidTableStream };
