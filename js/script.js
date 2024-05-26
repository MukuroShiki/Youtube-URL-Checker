function formatPublishedAt(publishedAt) {
    // Dateオブジェクトを生成
    const date = new Date(publishedAt);

    // 日本標準時（JST）に基づいてフォーマット
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Tokyo' // JSTを指定
    };
    const formattedDate = date.toLocaleString('ja-JP', options);

    return formattedDate.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1年$2月$3日').replace(/(\d{2}):(\d{2}):(\d{2})/, '$1時$2分$3秒');
}

function fetchVideoInfo() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = videoUrl.split('v=')[1];
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyBkZugqjwBzt6Tzu8Cy7TTs7MtKaR3Lvi4&part=snippet`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('APIの呼び出し制限に達しました。しばらくしてからもう一度お試しください。');
                } else {
                    throw new Error(`HTTPエラー: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            if (data.items.length === 0) {
                document.getElementById('videoInfo').innerHTML = '動画が見つかりませんでした。URLを確認してください。';
                return;
            }
            const snippet = data.items[0].snippet;
            
            // 改行コードを<br>タグに変換
            const formattedDescription = snippet.description.replace(/\n/g, '<br>');

            // Tagsが存在する場合は<li>タグで囲んで出力、存在しない場合は'None'を出力
            let tagsHtml = 'None';
            if (snippet.tags) {
                tagsHtml = '<ul>' + snippet.tags.map(tag => `<li>${tag}</li>`).join('') + '</ul>';
            }

            let snippetInfoHtml = `
                <img class="thumbnail" src="${snippet.thumbnails.high.url}" alt="サムネイル画像">
                <ul>
                    <li class="title">${snippet.title}</li>
                    <li class="channel">チャンネル名: ${snippet.channelTitle}</li>
                    <li class="date">投稿日時: ${formatPublishedAt(snippet.publishedAt)}</li>
                    <li class="category">カテゴリーID: ${snippet.categoryId}</li>
                </ul>
                <p class="description">動画説明文: <br>${formattedDescription}</p>
                <p class="tags">タグ: </p>${tagsHtml}
            `;
            document.getElementById('videoInfo').innerHTML = snippetInfoHtml;
        })
        .catch(error => {
            console.error('Error fetching video info:', error);
            document.getElementById('videoInfo').innerHTML = `エラーが発生しました: ${error.message}`;
        });
}
