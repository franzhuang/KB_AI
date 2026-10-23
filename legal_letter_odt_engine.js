/**
 * 郵局存證信函官方標準 ODT 純前端原生生成引擎
 * 完全移植自 fill_legal_letter_填入存證信函.py
 * 採用中華郵政官方 ODT 範本，保證 100% 符合每頁10行、每行20格、滿頁200字規範
 */

const ODF_NAMESPACES = {
  office: 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
  table: 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  text: 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  style: 'urn:oasis:names:tc:opendocument:xmlns:style:1.0',
  fo: 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0',
};

function splitIntoGridLines(paragraphs, charsPerLine = 20) {
  const gridLines = [];
  for (let para of paragraphs) {
    if (!para.trim()) continue;
    for (let i = 0; i < para.length; i += charsPerLine) {
      gridLines.push(para.substring(i, i + charsPerLine));
    }
  }
  return gridLines;
}

function fillOdtXmlDoc(doc, data, fontSize = null, keepBlankPages = false) {
  const gridLines = splitIntoGridLines(data.paragraphs || [], 20);
  const totalLines = gridLines.length;
  const pagesNeeded = Math.max(1, Math.ceil(totalLines / 10));
  const totalPages = keepBlankPages ? 10 : Math.min(10, pagesNeeded);

  // 若有自訂字級，動態建立自訂字級樣式；若無則使用範本預設 P19
  const customContentStyle = fontSize ? 'P_CONTENT_CUSTOM' : 'P19';
  if (fontSize) {
    let autoStyles = doc.getElementsByTagNameNS(ODF_NAMESPACES.office, 'automatic-styles')[0];
    if (!autoStyles) {
      autoStyles = doc.createElementNS(ODF_NAMESPACES.office, 'office:automatic-styles');
      doc.documentElement.appendChild(autoStyles);
    }
    const fsVal = (typeof fontSize === 'number' ? fontSize : parseFloat(fontSize)) + 'pt';

    const cStyle = doc.createElementNS(ODF_NAMESPACES.style, 'style:style');
    cStyle.setAttributeNS(ODF_NAMESPACES.style, 'style:name', customContentStyle);
    cStyle.setAttributeNS(ODF_NAMESPACES.style, 'style:family', 'paragraph');
    cStyle.setAttributeNS(ODF_NAMESPACES.style, 'style:parent-style-name', 'Table_20_Contents');

    const pProp = doc.createElementNS(ODF_NAMESPACES.style, 'style:paragraph-properties');
    pProp.setAttributeNS(ODF_NAMESPACES.fo, 'fo:text-align', 'center');
    pProp.setAttributeNS(ODF_NAMESPACES.style, 'style:justify-single-word', 'false');
    cStyle.appendChild(pProp);

    const tProp = doc.createElementNS(ODF_NAMESPACES.style, 'style:text-properties');
    tProp.setAttributeNS(ODF_NAMESPACES.fo, 'fo:font-size', fsVal);
    tProp.setAttributeNS(ODF_NAMESPACES.style, 'style:font-size-asian', fsVal);
    cStyle.appendChild(tProp);

    autoStyles.appendChild(cStyle);
  }

  // 取得全部表格
  const allTables = doc.getElementsByTagNameNS(ODF_NAMESPACES.table, 'table');
  const tableMap = {};
  for (let i = 0; i < allTables.length; i++) {
    const tbl = allTables[i];
    const name = tbl.getAttributeNS(ODF_NAMESPACES.table, 'name') || tbl.getAttribute('table:name');
    if (name) tableMap[name] = tbl;
  }

  // 2. 填入每一頁的頁首（寄件人、收件人、副本收件人）
  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const hTblName = `表格${1 + pIdx * 3}`;
    const hTbl = tableMap[hTblName];
    if (!hTbl) continue;

    const cells = hTbl.getElementsByTagNameNS(ODF_NAMESPACES.table, 'table-cell');
    if (cells.length < 2) continue;
    const b1 = cells[1];
    const ps = b1.getElementsByTagNameNS(ODF_NAMESPACES.text, 'p');

    // 寄件人姓名 (ps[1])
    if (data.sender_name && ps.length > 1) {
      const spans = ps[1].getElementsByTagNameNS(ODF_NAMESPACES.text, 'span');
      if (spans.length > 0) {
        const tabs = spans[0].getElementsByTagNameNS(ODF_NAMESPACES.text, 'tab');
        if (tabs.length > 0) {
          const tabEl = tabs[0];
          if (tabEl.nextSibling && tabEl.nextSibling.nodeType === 3) {
            tabEl.nextSibling.nodeValue = `姓名: ${data.sender_name}`;
          } else {
            spans[0].insertBefore(doc.createTextNode(`姓名: ${data.sender_name}`), tabEl.nextSibling);
          }
        }
      }
    }

    // 寄件人詳細地址 (ps[3])
    if (data.sender_addr && ps.length > 3) {
      const tabs = ps[3].getElementsByTagNameNS(ODF_NAMESPACES.text, 'tab');
      if (tabs.length > 0) {
        const tabEl = tabs[0];
        if (tabEl.nextSibling && tabEl.nextSibling.nodeType === 3) {
          tabEl.nextSibling.nodeValue = `詳細地址：${data.sender_addr}`;
        } else {
          ps[3].insertBefore(doc.createTextNode(`詳細地址：${data.sender_addr}`), tabEl.nextSibling);
        }
      }
    }

    // 收件人姓名 (ps[4])
    if (data.recipient_name && ps.length > 4) {
      const tabs = ps[4].getElementsByTagNameNS(ODF_NAMESPACES.text, 'tab');
      if (tabs.length > 0) {
        const tabEl = tabs[0];
        if (tabEl.nextSibling && tabEl.nextSibling.nodeType === 3) {
          tabEl.nextSibling.nodeValue = `姓名：${data.recipient_name}`;
        } else {
          ps[4].insertBefore(doc.createTextNode(`姓名：${data.recipient_name}`), tabEl.nextSibling);
        }
      }
    }

    // 收件人詳細地址 (ps[6])
    if (data.recipient_addr && ps.length > 6) {
      const tabs = ps[6].getElementsByTagNameNS(ODF_NAMESPACES.text, 'tab');
      if (tabs.length > 0) {
        const tabEl = tabs[0];
        if (tabEl.nextSibling && tabEl.nextSibling.nodeType === 3) {
          tabEl.nextSibling.nodeValue = `詳細地址：${data.recipient_addr}`;
        } else {
          ps[6].insertBefore(doc.createTextNode(`詳細地址：${data.recipient_addr}`), tabEl.nextSibling);
        }
      }
    }

    // 副本收件人姓名 (ps[7])
    if (data.copy_recipient_name && ps.length > 7) {
      const spans = ps[7].getElementsByTagNameNS(ODF_NAMESPACES.text, 'span');
      if (spans.length >= 4) {
        spans[3].textContent = `姓名：${data.copy_recipient_name}`;
      }
    }

    // 副本收件人詳細地址 (ps[8])
    if (data.copy_recipient_addr && ps.length > 8) {
      const tabs = ps[8].getElementsByTagNameNS(ODF_NAMESPACES.text, 'tab');
      if (tabs.length > 0) {
        const tabEl = tabs[0];
        if (tabEl.nextSibling && tabEl.nextSibling.nodeType === 3) {
          tabEl.nextSibling.nodeValue = `詳細地址：${data.copy_recipient_addr}`;
        } else {
          ps[8].insertBefore(doc.createTextNode(`詳細地址：${data.copy_recipient_addr}`), tabEl.nextSibling);
        }
      }
    }
  }

  // 3. 填入每一頁的頁尾（總頁數）
  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const fTblName = `表格${3 + pIdx * 3}`;
    const fTbl = tableMap[fTblName];
    if (!fTbl) continue;
    const ps = fTbl.getElementsByTagNameNS(ODF_NAMESPACES.text, 'p');
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.textContent.includes('本存證信函共')) {
        const sList = p.getElementsByTagNameNS(ODF_NAMESPACES.text, 's');
        if (sList.length > 0) {
          sList[0].setAttributeNS(ODF_NAMESPACES.text, 'text:c', '2');
          const sEl = sList[0];
          if (sEl.nextSibling && sEl.nextSibling.nodeType === 3) {
            sEl.nextSibling.nodeValue = `${pagesNeeded}  頁，正本 `;
          } else {
            p.insertBefore(doc.createTextNode(`${pagesNeeded}  頁，正本 `), sEl.nextSibling);
          }
        }
      }
    }
  }

  // 4. 填入內文格位（每行 20 格、每頁 10 行）
  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const gTblName = `表格${2 + pIdx * 3}`;
    const gTbl = tableMap[gTblName];
    if (!gTbl) continue;

    const rows = gTbl.getElementsByTagNameNS(ODF_NAMESPACES.table, 'table-row');
    for (let r = 1; r <= 10; r++) {
      if (r >= rows.length) break;
      const lineIdx = pIdx * 10 + (r - 1);
      const lineContent = lineIdx < totalLines ? gridLines[lineIdx] : '';
      const cells = rows[r].getElementsByTagNameNS(ODF_NAMESPACES.table, 'table-cell');

      for (let c = 1; c <= 20; c++) {
        if (c >= cells.length) break;
        const char = (c - 1) < lineContent.length ? lineContent[c - 1] : '';
        const pList = cells[c].getElementsByTagNameNS(ODF_NAMESPACES.text, 'p');
        if (pList.length > 0) {
          pList[0].textContent = char;
          if (fontSize) {
            pList[0].setAttributeNS(ODF_NAMESPACES.text, 'text:style-name', customContentStyle);
          }
        } else {
          const pNew = doc.createElementNS(ODF_NAMESPACES.text, 'text:p');
          pNew.setAttributeNS(ODF_NAMESPACES.text, 'text:style-name', customContentStyle);
          if (char) pNew.textContent = char;
          cells[c].appendChild(pNew);
        }
      }
    }
  }

  // 5. 移除多餘空白頁次（若未指定保留空白頁）
  if (!keepBlankPages && pagesNeeded < 10) {
    const officeText = doc.getElementsByTagNameNS(ODF_NAMESPACES.office, 'text')[0];
    if (officeText) {
      const firstRemoveTable = `表格${1 + pagesNeeded * 3}`;
      let keep = true;
      const toRemove = [];
      const children = Array.from(officeText.children);

      for (let child of children) {
        const name = child.getAttributeNS(ODF_NAMESPACES.table, 'name') || child.getAttribute('table:name');
        if (name === firstRemoveTable) {
          keep = false;
        }
        if (!keep) {
          toRemove.push(child);
        }
      }

      for (let el of toRemove) {
        officeText.removeChild(el);
      }

      const remainingChildren = officeText.children;
      if (remainingChildren.length > 0) {
        const lastChild = remainingChildren[remainingChildren.length - 1];
        const styleName = lastChild.getAttributeNS(ODF_NAMESPACES.text, 'style-name') || lastChild.getAttribute('text:style-name');
        if (styleName === 'P38') {
          officeText.removeChild(lastChild);
        }
      }
    }
  }

  return new XMLSerializer().serializeToString(doc);
}

/**
 * 在瀏覽器中產生中華郵政標準 ODT 二進位 Blob 物件
 */
async function generateOfficialOdtBlob(data, fontSize = null, keepBlankPages = false) {
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip 程式庫未載入');
  }
  if (typeof ODT_TEMPLATE_ZIP_B64 === 'undefined') {
    throw new Error('存證信函範本資料未載入');
  }

  const zip = await JSZip.loadAsync(ODT_TEMPLATE_ZIP_B64, { base64: true });
  const xmlText = await zip.file('content.xml').async('string');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const newXmlText = fillOdtXmlDoc(doc, data, fontSize, keepBlankPages);
  zip.file('content.xml', newXmlText);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return blob;
}

if (typeof window !== 'undefined') {
  window.generateOfficialOdtBlob = generateOfficialOdtBlob;
}
if (typeof module !== 'undefined') {
  module.exports = { generateOfficialOdtBlob, fillOdtXmlDoc };
}
