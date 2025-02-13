// ==UserScript==
// @name         Twitter Tweet Scraper
// @version      1.9
// @author       raichan_0627
// @match        https://x.com/search*
// @match        https://twitter.com/search*
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isRunning = false; // 動作フラグ
    let interval; // スクロール処理用の変数
    let countdownTimer; // タイマー用
    let countdownValue = 120; // 2分（120秒）

    // Google Fonts から Noto Sans JP を適用
    const notoFont = document.createElement("link");
    notoFont.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap";
    notoFont.rel = "stylesheet";
    document.head.appendChild(notoFont);

    // UIコンテナ（右上に配置）
    const uiContainer = document.createElement("div");
    uiContainer.style.position = "fixed";
    uiContainer.style.top = "10px";
    uiContainer.style.right = "10px";
    uiContainer.style.display = "flex";
    uiContainer.style.flexDirection = "column";
    uiContainer.style.gap = "10px";
    uiContainer.style.padding = "10px";
    uiContainer.style.backgroundColor = "#fff";
    uiContainer.style.border = "1px solid #ccc";
    uiContainer.style.borderRadius = "5px";
    uiContainer.style.zIndex = "9999";
    uiContainer.style.fontFamily = "'Noto Sans JP', sans-serif";
    document.body.appendChild(uiContainer);

    // スクロール開始/停止ボタン
    const toggleButton = document.createElement("button");
    toggleButton.innerText = "スクロール開始";
    toggleButton.style.padding = "10px";
    toggleButton.style.width = "150px";
    toggleButton.style.backgroundColor = "#1DA1F2";
    toggleButton.style.color = "#fff";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.textAlign = "center";
    toggleButton.style.fontFamily = "'Noto Sans JP', sans-serif";
    toggleButton.style.fontSize = "16px";
    toggleButton.style.fontWeight = "700";
    uiContainer.appendChild(toggleButton);

    // 停止ボタン
    const stopButton = document.createElement("button");
    stopButton.innerText = "停止";
    stopButton.style.padding = "10px";
    stopButton.style.width = "150px";
    stopButton.style.backgroundColor = "#FF0000"; // 赤色
    stopButton.style.color = "#fff";
    stopButton.style.border = "none";
    stopButton.style.borderRadius = "5px";
    stopButton.style.cursor = "pointer";
    stopButton.style.textAlign = "center";
    stopButton.style.fontFamily = "'Noto Sans JP', sans-serif";
    stopButton.style.fontSize = "16px";
    stopButton.style.fontWeight = "700";
    stopButton.style.display = "none"; // 初期状態では非表示
    uiContainer.appendChild(stopButton);

    // ステータス表示
    const statusLabel = document.createElement("div");
    statusLabel.innerText = "ステータス: 停止中";
    statusLabel.style.fontSize = "14px";
    statusLabel.style.color = "#333";
    statusLabel.style.fontFamily = "'Noto Sans JP', sans-serif";
    uiContainer.appendChild(statusLabel);

    // タイマー表示
    const timerLabel = document.createElement("div");
    timerLabel.innerText = "待機時間: なし";
    timerLabel.style.fontSize = "14px";
    timerLabel.style.color = "#FF0000";
    timerLabel.style.fontFamily = "'Noto Sans JP', sans-serif";
    uiContainer.appendChild(timerLabel);

    // スクロール関数
    function autoScroll() {
        if (isRunning) return;
        isRunning = true;
        toggleButton.style.display = "none"; // スクロール開始ボタンを非表示
        stopButton.style.display = "block"; // 停止ボタンを表示
        statusLabel.innerText = "ステータス: スクロール中";

        interval = setInterval(() => {
            if (!isRunning) {
                clearInterval(interval);
                return;
            }

            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

            setTimeout(() => {
                let retryButton = getRetryButton();

                if (retryButton) {
                    console.log("やりなおすボタンを検出。2分待機...");
                    clearInterval(interval);
                    isRunning = false;
                    statusLabel.innerText = "ステータス: 待機中 (2:00)";
                    countdownValue = 120; // 2分 = 120秒

                    clearInterval(countdownTimer); // タイマーをリセット
                    updateTimer(); // タイマー更新開始

                    // 2分（120秒）待機
                    countdownTimer = setInterval(() => {
                        countdownValue--;
                        updateTimer();
                        if (countdownValue <= 0) {
                            clearInterval(countdownTimer);
                            console.log("2分経過。やりなおすボタンをクリック");

                            // `click()` では動作しない場合、`dispatchEvent` を使う
                            retryButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

                            setTimeout(autoScroll, 3000); // 3秒後にスクロール再開
                        }
                    }, 1000);
                }
            }, 3000);
        }, 3000);
    }

    // 「やりなおす」ボタンをXPathで取得
    function getRetryButton() {
        let xpath = "//span[text()='やりなおす']";
        let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue ? result.singleNodeValue.closest("button") : null;
    }

    // タイマー表示を更新
    function updateTimer() {
        let minutes = Math.floor(countdownValue / 60);
        let seconds = countdownValue % 60;
        timerLabel.innerText = `待機時間: ${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    // 開始ボタンのクリックイベント
    toggleButton.addEventListener("click", () => {
        if (!isRunning) {
            console.log("スクロール開始");
            autoScroll();
        }
    });

    // 停止ボタンのクリックイベント
    stopButton.addEventListener("click", () => {
        console.log("スクロール停止");
        isRunning = false;
        clearInterval(interval);
        clearInterval(countdownTimer);
        toggleButton.style.display = "block"; // スクロール開始ボタンを表示
        stopButton.style.display = "none"; // 停止ボタンを非表示
        statusLabel.innerText = "ステータス: 停止中";
        timerLabel.innerText = "待機時間: なし";
    });
})();
