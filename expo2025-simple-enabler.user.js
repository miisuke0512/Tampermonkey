// ==UserScript==
// @name         EXPO2025 Simple Ticket Enabler
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  EXPO2025チケット予約サイトでdata-disabled属性を削除（シンプル版）
// @author       You
// @match        https://ticket.expo2025.or.jp/ticket_visiting_reservation/*
// @match        https://ticket.expo2025.or.jp/ticket_visiting_reservation/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    function enableButtons() {
        // data-disabled="true"を持つすべての要素を検索して属性を削除
        document.querySelectorAll('[data-disabled="true"]').forEach(element => {
            element.removeAttribute('data-disabled');
            console.log('data-disabled属性を削除:', element);
        });
    }
    
    // 初回実行
    setTimeout(enableButtons, 1000);
    
    // DOM変更監視
    new MutationObserver(() => {
        if (document.querySelectorAll('[data-disabled="true"]').length > 0) {
            enableButtons();
        }
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-disabled']
    });
    
    // 定期チェック
    setInterval(enableButtons, 3000);
})();