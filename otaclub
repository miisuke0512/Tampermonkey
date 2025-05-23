// ==UserScript==
// @name         おたクラブ入力ツール
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  スプレ貼り付けで品番自動入力
// @match        https://otaclub.jp/products/category-paper/sticker_print/item_diecut_seal/*
// @match        https://otaclub.jp/products/category-paper/card_item/item_instant_photocard/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('paste', function(e) {
        const paste = (e.clipboardData || window.clipboardData).getData('text');

        if (!paste) return;

        // 改行で行に分割
        const rows = paste.trim().split(/\r?\n/);

        rows.forEach((row, index) => {
            const columns = row.split(/\t|,/); // タブまたはカンマで分割

            const nameInput = document.getElementById(`draft_kind_name_${index}`);
            const dataInput = document.getElementById(`draft_kind_data_${index}`);

            if (nameInput && columns[0] !== undefined) {
                nameInput.value = columns[0].trim();
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (dataInput && columns[1] !== undefined) {
                dataInput.value = columns[1].trim();
                dataInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
})();
