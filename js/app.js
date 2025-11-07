// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
  const resultRoot = document.getElementById('result');

  // 1) 로컬 스토리지에서 값 불러오기
  const space = localStorage.getItem('space');
  const style = localStorage.getItem('style');
  const furniture = localStorage.getItem('furniture');

  if (!space || !style || !furniture) {
    // 선택이 완성되지 않았으면 안내 후 홈으로
    resultRoot.innerHTML = `
      <div class="notice">
        <p>선택이 완료되지 않았습니다.</p>
        <div class="notice-actions">
          <button onclick="location.href='index.html'" class="btn-secondary">처음으로</button>
          <button onclick="location.href='space.html'">공간부터 선택하기</button>
        </div>
      </div>
    `;
    return;
  }

  // 2) JSON 데이터 로드
  try {
    const resp = await fetch('data/designs.json');
    if (!resp.ok) throw new Error('designs.json 로드 실패');
    const data = await resp.json();

    // 3) 매칭 찾기
    const match = data.find(item =>
      item.space === space && item.style === style && item.furniture === furniture
    );

    // 4) 결과 렌더링
    const content = document.createElement('div');
    content.className = 'result-content';

    if (!match) {
      content.innerHTML = `
        <div class="no-result">
          <h3>해당 조합의 디자인을 찾을 수 없습니다.</h3>
          <p>다른 조합을 시도하거나, 처음으로 돌아가세요.</p>
          <div style="margin-top:14px">
            <button onclick="location.href='furniture.html'" class="btn-secondary">이전으로</button>
            <button onclick="location.href='index.html'" class="btn-primary">처음으로</button>
          </div>
        </div>
      `;
      resultRoot.appendChild(content);
      return;
    }

    const images = Array.isArray(match.images) ? match.images : (match.image ? [match.image] : []);
    const description = match.description || `${space} · ${style} · ${furniture} 조합의 추천 이미지들입니다.`;

    // 제목 + 설명
    const titleHTML = document.createElement('div');
    titleHTML.className = 'result-header';
    titleHTML.innerHTML = `<h3>추천 디자인</h3><p class="desc">${description}</p>`;
    content.appendChild(titleHTML);

    // 갤러리
    const gallery = document.createElement('div');
    gallery.className = 'image-gallery';

    images.forEach(imgName => {
      const img = document.createElement('img');
      img.src = `images/${imgName}`;
      img.alt = `${space} ${style} ${furniture}`;
      img.loading = 'lazy';
      gallery.appendChild(img);
    });

    content.appendChild(gallery);

    // 버튼 영역
    const actions = document.createElement('div');
    actions.className = 'result-actions';
    actions.innerHTML = `
      <button class="btn-secondary" onclick="location.href='furniture.html'">다시 선택</button>
      <button class="btn-primary" onclick="saveAsPreset()">이 조합 저장</button>
    `;
    content.appendChild(actions);
    resultRoot.appendChild(content);

    // 조합 저장
    window.saveAsPreset = function() {
      const presets = JSON.parse(localStorage.getItem('presets') || '[]');
      presets.push({ space, style, furniture, timestamp: Date.now() });
      localStorage.setItem('presets', JSON.stringify(presets));
      alert('조합이 저장되었습니다. (브라우저 로컬)');
    };

  } catch (e) {
    console.error(e);
    resultRoot.innerHTML = `<p class="error">데이터를 불러오는 중 오류가 발생했습니다.</p>`;
  }
});

// ✅ 클릭 시 열리고 클릭 시 닫히는 팝업 (단일 버전)
document.addEventListener("click", (e) => {
  // 이미지 클릭 시 팝업 열기
  if (e.target.tagName === "IMG" && e.target.closest(".image-gallery")) {
    const popup = document.createElement("div");
    popup.className = "image-popup active";
    popup.innerHTML = `<img src="${e.target.src}" alt="확대 이미지">`;
    popup.addEventListener("click", () => popup.remove()); // 클릭 시 닫기
    document.body.appendChild(popup);
  }
});
