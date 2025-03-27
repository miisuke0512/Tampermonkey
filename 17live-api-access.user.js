// ==UserScript==
// @name         17.live API Access
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  17.liveのAPIデータにアクセスするスクリプト
// @author       You
// @match        https://17.live/ja*
// @grant        GM_xmlhttpRequest
// @connect      wap-api.17app.co
// ==/UserScript==

(function() {
    'use strict';

    // スタイルを追加
    const addStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .api-data-panel {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0.9);
                color: white;
                z-index: 10000;
                padding: 20px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                display: flex;
                flex-direction: column;
            }
            .api-data-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                position: sticky;
                top: 0;
                background-color: rgba(0, 0, 0, 0.8);
                padding: 10px;
                z-index: 10001;
            }
            .api-data-panel h3 {
                margin: 0;
                font-size: 18px;
            }
            .api-control-panel {
                display: flex;
                gap: 10px;
            }
            .api-data-content {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
                padding: 10px;
            }
            .api-data-item {
                background-color: rgba(40, 40, 40, 0.8);
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
                position: relative;
            }
            .api-data-item:hover {
                background-color: rgba(60, 60, 60, 0.8);
            }
            .api-data-item.expanded {
                grid-column: span 2;
            }
            .api-data-username {
                font-weight: bold;
                color: #ff6b81;
                font-size: 16px;
                margin-bottom: 5px;
            }
            .api-data-viewers {
                color: #72ccff;
                font-weight: bold;
            }
            .api-button {
                background: #ff6b81;
                border: none;
                color: white;
                padding: 8px 15px;
                border-radius: 3px;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 12px;
            }
            .api-button:hover {
                background: #ff4d67;
            }
            .api-button.secondary {
                background: #5c5c5c;
            }
            .api-button.secondary:hover {
                background: #777;
            }
            .api-button.danger {
                background: #ff3b30;
            }
            .api-button.danger:hover {
                background: #d63026;
            }
            .website-content {
                max-height: 100px;
                overflow-y: auto;
                background-color: rgba(255, 255, 255, 0.1);
                padding: 5px;
                margin-top: 5px;
                border-radius: 3px;
                white-space: pre-wrap;
                word-break: break-all;
                font-size: 10px;
            }
            .user-bio {
                max-height: 80px;
                overflow-y: auto;
                background-color: rgba(255, 255, 255, 0.1);
                padding: 5px;
                margin-top: 5px;
                border-radius: 3px;
                white-space: pre-wrap;
                word-break: break-all;
                font-size: 10px;
            }
            .item-actions {
                display: flex;
                gap: 5px;
                margin-top: 10px;
            }
            .api-status {
                margin-left: 15px;
                font-size: 12px;
                color: #aaa;
            }
            .api-data-details {
                margin-top: 10px;
                display: none;
            }
            .api-data-item.expanded .api-data-details {
                display: block;
            }
            .data-stats {
                display: flex;
                gap: 15px;
                margin-bottom: 10px;
            }
            .stat-item {
                background: rgba(255,255,255,0.1);
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 11px;
            }
            .loading-indicator {
                text-align: center;
                padding: 20px;
                color: #ff6b81;
                font-size: 14px;
            }
            .filter-panel {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 10px;
            }
            .filter-label {
                font-size: 12px;
                color: #aaa;
            }
            .minimized-view {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                cursor: pointer;
                display: none;
            }
        `;
        document.head.appendChild(style);
    };

    // 保存されたデータを取得
    const getSavedData = () => {
        const savedData = localStorage.getItem('17live_viewed_users');
        return savedData ? JSON.parse(savedData) : [];
    };

    // データを保存
    const saveData = (data) => {
        localStorage.setItem('17live_viewed_users', JSON.stringify(data));
    };

    // APIからデータを取得
    const fetchApiData = (cursor = '') => {
        return new Promise((resolve, reject) => {
            const url = `https://wap-api.17app.co/api/v1/cells?count=20&cursor=${cursor}&paging=1&region=JP&tab=hot_opt`;
            
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    };

    // 全データを再帰的に取得
    let allCells = [];
    let isLoadingMore = false;
    let currentCursor = '';
    let hasMoreData = true;

    const loadMoreData = async (statusCallback) => {
        if (isLoadingMore || !hasMoreData) return;
        
        isLoadingMore = true;
        statusCallback(`次のデータをロード中... (現在 ${allCells.length} 件)`);
        
        try {
            const data = await fetchApiData(currentCursor);
            
            if (data && data.cells && Array.isArray(data.cells) && data.cells.length > 0) {
                // フィルターされたセルを追加
                const filteredCells = data.cells.filter(cell => {
                    const website = cell.stream?.userInfo?.website || '';
                    return website.includes('https://');
                });
                
                allCells = [...allCells, ...filteredCells];
                
                // カーソル更新
                currentCursor = data.cursor || '';
                hasMoreData = !!data.cursor;
                
                statusCallback(`${filteredCells.length}件のデータを読み込みました (合計 ${allCells.length} 件)`);
                
                // データ表示を更新
                updateDataDisplay();
            } else {
                hasMoreData = false;
                statusCallback('これ以上データはありません');
            }
        } catch (error) {
            console.error('API取得エラー:', error);
            statusCallback(`エラー: ${error.message}`);
        } finally {
            isLoadingMore = false;
        }
    };

    // UIを生成
    const createUI = () => {
        const panel = document.createElement('div');
        panel.className = 'api-data-panel';
        panel.innerHTML = `
            <div class="api-data-header">
                <h3>17.live API データ</h3>
                <div class="api-status">ステータス: 準備完了</div>
                <div class="api-control-panel">
                    <button id="load-more-data" class="api-button">もっと読み込む</button>
                    <button id="minimize-panel" class="api-button secondary">最小化</button>
                    <button id="toggle-api-panel" class="api-button danger">閉じる</button>
                </div>
            </div>
            <div class="filter-panel">
                <span class="filter-label">表示中: https:// を含むユーザーのみ</span>
            </div>
            <div id="api-data-content" class="api-data-content"></div>
            <div id="loading-indicator" class="loading-indicator"></div>
        `;
        
        const minimizedView = document.createElement('div');
        minimizedView.className = 'minimized-view';
        minimizedView.innerHTML = '17.live APIビューアを表示';
        minimizedView.style.display = 'none';
        
        document.body.appendChild(panel);
        document.body.appendChild(minimizedView);

        // イベントリスナーを追加
        document.getElementById('load-more-data').addEventListener('click', () => {
            loadMoreData(updateStatus);
        });
        
        document.getElementById('toggle-api-panel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        document.getElementById('minimize-panel').addEventListener('click', () => {
            panel.style.display = 'none';
            minimizedView.style.display = 'block';
        });
        
        minimizedView.addEventListener('click', () => {
            panel.style.display = 'flex';
            minimizedView.style.display = 'none';
        });

        return panel;
    };

    // ステータス表示を更新
    const updateStatus = (message) => {
        const statusElement = document.querySelector('.api-status');
        if (statusElement) {
            statusElement.textContent = `ステータス: ${message}`;
        }
        
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.textContent = message;
        }
    };

    // ユーザーを削除
    const removeUser = (index) => {
        allCells.splice(index, 1);
        updateDataDisplay();
    };

    // データ表示を更新
    const updateDataDisplay = () => {
        const contentElement = document.getElementById('api-data-content');
        if (!contentElement) return;
        
        contentElement.innerHTML = '';
        
        if (allCells.length === 0) {
            contentElement.innerHTML = '<div>データがありません。「もっと読み込む」をクリックしてください。</div>';
            return;
        }

        // 閲覧済みユーザーの取得
        const viewedUsers = getSavedData();
        
        allCells.forEach((cell, index) => {
            // データ構造の安全なアクセス
            const userInfo = cell.stream?.userInfo || {};
            const streamInfo = cell.stream || {};
            
            const name = userInfo.displayName || userInfo.name || userInfo.openID || '名前なし';
            const openId = userInfo.openID || 'ID不明';
            const viewers = streamInfo.liveViewerCount || streamInfo.viewerCount || 0;
            const caption = streamInfo.caption || '配信タイトルなし';
            const userId = userInfo.userID || '';
            const website = userInfo.website || '';
            const bio = userInfo.bio || '';
            const roomID = streamInfo.liveStreamID || '';
            
            // 既に閲覧したユーザーかチェック
            const isViewed = viewedUsers.includes(userId);
            
            const cellDiv = document.createElement('div');
            cellDiv.className = `api-data-item ${isViewed ? 'viewed' : ''}`;
            cellDiv.dataset.index = index;
            
            // 簡易表示用HTML
            cellDiv.innerHTML = `
                <div class="api-data-summary">
                    <div class="api-data-username">${name}</div>
                    <div class="data-stats">
                        <div class="stat-item"><span class="api-data-viewers">視聴者: ${viewers}</span></div>
                        <div class="stat-item">ID: ${openId}</div>
                    </div>
                    <div class="item-actions">
                        <button class="api-button toggle-details">詳細</button>
                        <button class="api-button visit-room">配信を見る</button>
                        <button class="api-button danger remove-user">削除</button>
                    </div>
                </div>
                <div class="api-data-details">
                    <div>タイトル: ${caption}</div>
                    <div>ユーザーID: ${userId}</div>
                    <div>ルームID: ${roomID}</div>
                    
                    ${bio ? `<div>自己紹介:<div class="user-bio">${bio}</div></div>` : ''}
                    
                    ${website ? `<div>ウェブサイト:<div class="website-content">${website}</div></div>` : ''}
                    
                    ${streamInfo.coverPhoto ? `<div><img src="${streamInfo.coverPhoto}" width="100%" style="margin-top:10px;border-radius:5px;"></div>` : ''}
                </div>
            `;
            
            // 閲覧済みのスタイル
            if (isViewed) {
                cellDiv.style.opacity = '0.6';
                cellDiv.style.border = '1px solid rgba(255, 107, 129, 0.3)';
            }
            
            contentElement.appendChild(cellDiv);
            
            // イベントリスナーを追加
            cellDiv.querySelector('.toggle-details').addEventListener('click', () => {
                cellDiv.classList.toggle('expanded');
                const button = cellDiv.querySelector('.toggle-details');
                button.textContent = cellDiv.classList.contains('expanded') ? '閉じる' : '詳細';
            });
            
            cellDiv.querySelector('.visit-room').addEventListener('click', () => {
                if (roomID) {
                    // 訪問済みとしてマーク
                    if (!viewedUsers.includes(userId)) {
                        viewedUsers.push(userId);
                        saveData(viewedUsers);
                        cellDiv.classList.add('viewed');
                        cellDiv.style.opacity = '0.6';
                    }
                    
                    // 新しいタブでルームを開く
                    window.open(`https://17.live/ja/live/${roomID}`, '_blank');
                } else {
                    alert('ルームIDが見つかりません');
                }
            });
            
            cellDiv.querySelector('.remove-user').addEventListener('click', () => {
                removeUser(index);
            });
        });
    };

    // 初期化
    const init = () => {
        // ページ読み込み後に実行
        window.addEventListener('load', () => {
            setTimeout(() => {
                addStyles();
                createUI();
                // 初回データ読み込み
                loadMoreData(updateStatus);
            }, 2000); // 2秒後に実行
        });
    };

    init();
})();
