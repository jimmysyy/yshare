document.addEventListener('DOMContentLoaded', function () {
  fetch('assets/data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('无法加载 assets/data.json，状态码：' + res.status);
      return res.json();
    })
    .then(function (data) {
      renderSite(data.site);
      renderTabs(data.tabs);
      renderPanels(data.tabs);
      // 默认激活第一个 Tab
      if (data.tabs.length > 0) {
        switchTab(data.tabs[0].key);
      }
    })
    .catch(function (err) {
      // 加载失败时在页面中显示错误提示，方便排查
      document.querySelector('.main').innerHTML =
        '<div style="color:red;padding:40px;text-align:center">' +
        '⚠️ 数据加载失败：' + err.message +
        '<br><small>请确认 assets/data.json 文件存在，且通过 HTTP 服务器访问（不能直接双击打开 html 文件）</small>' +
        '</div>';
    });
});


function renderSite(site) {
  // 页面 <title> 标签
  document.title = site.title;
  // 导航品牌名
  var brand = document.querySelector('.navbar-brand');
  if (brand) brand.textContent = '📦 ' + site.title;
  // 主标题
  document.querySelector('.page-title').textContent = site.title;
  // 副标题
  document.querySelector('.page-subtitle').textContent = site.subtitle;
  // 提示横幅（允许 HTML，如 <strong> 标签）
  document.querySelector('.tip-text').innerHTML = site.tip;
}


function renderTabs(tabs) {
  var container = document.querySelector('.tabs');
  container.innerHTML = '';   // 清空旧内容

  tabs.forEach(function (tab, index) {
    var btn = document.createElement('button');
    btn.className  = 'tab-btn' + (index === 0 ? ' active' : '');
    btn.role       = 'tab';
    btn.textContent = tab.label;
    btn.setAttribute('data-key', tab.key);
    btn.addEventListener('click', function () { switchTab(tab.key); });
    container.appendChild(btn);
  });
}


function renderPanels(tabs) {
  var main = document.querySelector('.main');
  // 删除旧面板（保留标题 / 副标题 / 提示横幅）
  main.querySelectorAll('.panel').forEach(function (el) { el.remove(); });

  tabs.forEach(function (tab, tabIndex) {
    var panel = document.createElement('div');
    panel.id        = 'panel-' + tab.key;
    panel.className = 'panel' + (tabIndex === 0 ? ' active' : '');

    tab.sections.forEach(function (section) {
      panel.appendChild(buildSection(section));
    });

    main.appendChild(panel);
  });
}

/**
 * 构建一个分区（section-badge + table-card）
 * @param {Object} section - data.json 中单个 section 对象
 */
function buildSection(section) {
  var wrapper = document.createElement('div');
  wrapper.className = 'section';

  // ---- 分区标题 ----
  var header = document.createElement('div');
  header.className = 'section-header';
  var badge = document.createElement('span');
  badge.className = 'section-badge ' + (section.color || 'blue');
  // blue 是默认值，style.css 中 .section-badge 本身就是蓝色，加 .blue 不影响
  badge.textContent = section.title;
  header.appendChild(badge);
  wrapper.appendChild(header);

  // ---- 表格卡片 ----
  var card = document.createElement('div');
  card.className = 'table-card';

  var table = buildTable(section.items);
  card.appendChild(table);

  // ---- 显示更多按钮（只有存在 hidden:true 的条目才渲染） ----
  var hasHidden = section.items.some(function (item) { return item.hidden; });
  if (hasHidden) {
    var moreWrap = document.createElement('div');
    moreWrap.className = 'show-more-wrap';
    var moreBtn = document.createElement('button');
    moreBtn.className   = 'show-more-btn';
    moreBtn.textContent = '显示更多';
    moreBtn.addEventListener('click', function () { toggleMore(moreBtn); });
    moreWrap.appendChild(moreBtn);
    card.appendChild(moreWrap);
  }

  wrapper.appendChild(card);
  return wrapper;
}

/**
 * 构建资源表格（thead + tbody）
 * @param {Array} items - 资源条目数组
 */
function buildTable(items) {
  var table = document.createElement('table');
  table.className = 'resource-table';

  // thead — 三个网盘列合并为一个"下载链接"列
  table.innerHTML =
    '<thead><tr>' +
    '<th>名称</th>' +
    '<th>简介</th>' +
    '<th>下载链接</th>' +
    '<th>更新时间</th>' +
    '</tr></thead>';

  // tbody
  var tbody = document.createElement('tbody');
  items.forEach(function (item) {
    tbody.appendChild(buildRow(item));
  });
  table.appendChild(tbody);
  return table;
}

/**
 * 构建单行 <tr>
 * @param {Object} item - 单个资源对象
 */
function buildRow(item) {
  var tr = document.createElement('tr');
  if (item.hidden) tr.className = 'hidden-row';

  // 名称
  var tdName = document.createElement('td');
  tdName.className   = 'col-name';
  tdName.textContent = item.name;

  // 简介（展开按钮 + 描述文字）
  var tdDesc   = document.createElement('td');
  var descBtn  = document.createElement('button');
  descBtn.className = 'desc-toggle';
  descBtn.innerHTML =
    '<span class="desc-arrow">▶</span>' +
    '<span class="desc-label"> 查看描述</span>';
  descBtn.addEventListener('click', function () { toggleDesc(descBtn); });

  var descText = document.createElement('div');
  descText.className   = 'desc-text';
  descText.textContent = item.desc;

  tdDesc.appendChild(descBtn);
  tdDesc.appendChild(descText);

  // 链接列 — 百度、夸克、其他合并在同一单元格内横排显示
  var tdLinks = document.createElement('td');
  var group   = document.createElement('div');
  group.className = 'link-group';

  var linkDefs = [
    { url: item.links.baidu, label: '百度' },
    { url: item.links.quark, label: '夸克' },
    { url: item.links.other, label: '其他' },
  ];
  linkDefs.forEach(function (def) {
    if (def.url) {
      var a = document.createElement('a');
      a.href      = def.url;
      a.className = 'link-btn';
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';
      a.textContent = '🔗 ' + def.label;
      group.appendChild(a);
    } else {
      var span = document.createElement('span');
      span.className   = 'link-btn disabled';
      span.textContent = def.label + ' 暂无';
      group.appendChild(span);
    }
  });
  tdLinks.appendChild(group);

  // 日期
  var tdDate = document.createElement('td');
  tdDate.className   = 'col-date';
  tdDate.textContent = item.date;

  tr.append(tdName, tdDesc, tdLinks, tdDate);
  return tr;
}


/* ----------------------------------------------------------------
   5. Tab 切换
   由渲染函数内部调用，也可外部直接调用 switchTab('books')
---------------------------------------------------------------- */
function switchTab(key) {
  // 切换面板
  document.querySelectorAll('.panel').forEach(function (panel) {
    panel.classList.toggle('active', panel.id === 'panel-' + key);
  });
  // 切换按钮激活态
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-key') === key);
  });
}


/* ----------------------------------------------------------------
   6. 展开 / 收起描述
   由 buildRow() 内部绑定，无需手动调用
---------------------------------------------------------------- */
function toggleDesc(btn) {
  var desc   = btn.nextElementSibling;        // .desc-text div
  var label  = btn.querySelector('.desc-label');
  var isOpen = btn.classList.toggle('open');
  desc.style.display = isOpen ? 'block' : 'none';
  label.textContent  = isOpen ? ' 收起描述' : ' 查看描述';
}


/* ----------------------------------------------------------------
   7. 显示更多 / 收起更多（双向切换）
   由 buildSection() 内部绑定，无需手动调用
---------------------------------------------------------------- */
function toggleMore(btn) {
  var table      = btn.closest('.table-card').querySelector('table');
  var hiddenRows = table.querySelectorAll('tr.hidden-row');
  var isExpanded = hiddenRows[0] && hiddenRows[0].classList.contains('revealed');

  hiddenRows.forEach(function (tr) {
    tr.classList.toggle('revealed', !isExpanded);
  });
  btn.textContent = isExpanded ? '显示更多' : '收起更多';
}
