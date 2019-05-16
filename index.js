
'use strict';

const LANG_T = antSword['language']['toastr']; // 通用通知提示
const LANG = require('./language/'); // 插件语言库

const iconv = require('iconv-lite')
/**
 * 插件类
*/
class Plugin {
  constructor(opt) {
    let self = this;
    let hash = String(Math.random()).substr(2, 10);
    antSword.tabbar.addTab(
      `tab_messycoderecover_${hash}`,
      `<i class="fa fa-text-width"></i> ${LANG['title']}`,
      null, null, true, true
    );
    let cell = antSword.tabbar.cells(`tab_messycoderecover_${hash}`);
    self.cell = cell;
    self.support_encoding = [
      'GBK',
      'GB2312',
      'UTF8',
      'BIG5',
      'Euc-KR',
      'Euc-JP',
      'Shift_JIS',
      'ISO-8859-1',
      'Windows-874',
      'Windows-1251'
    ];
    self.createMainLayout();
    self.bindToolbarClickHandler();
  }

  createMainLayout() {
    let self = this;
    let layout = self.cell.attachLayout('2E');
    layout.cells('a').hideHeader();
    layout.cells('a').setText(`<i class="fa fa-cogs"></i> ${LANG['cell']['cella']}`);
    layout.cells('b').setText(`<i class="fa fa-bars"></i> ${LANG['cell']['cellb']}`);
    layout.cells('b').collapse();
    // 创建toolbar
    this.createToolbar(layout.cells('a'));
    // 创建form
    this.createForm(layout.cells('a'));
    // 创建grid
    this.createGrid(layout.cells('b'));

    this.layout = layout;
  }

  createToolbar(cell) {
    let toolbar = cell.attachToolbar();
    toolbar.loadStruct([
      { id: 'start', type: 'button', text: LANG['toolbar']['start'], icon: 'play' },
      { id: 'reset', type: 'button', text: LANG['toolbar']['reset'], icon: 'undo' },
      { id: 'online', type: 'button', text: LANG['toolbar']['online'], icon: 'chrome' },
    ]);
    this.toolbar = toolbar;
  }

  createForm(cell) {
    let formdata = [{
      type: 'settings', position: 'label-left',
      labelWidth: 150, inputWidth: 500
    }, {
      type: 'block', inputWidth: 'auto',
      offsetTop: 12,
      list: [{
        type: 'input', label: LANG['form']['inputtext'], name: 'inputtext', rows: "20",
        required: true, validate:"NotEmpty", value: "锘挎槬鐪犱笉瑙夋檽锛屽澶勯椈鍟奸笩",
      }],
    }];
    let form = cell.attachForm(formdata, true);
    form.enableLiveValidation(true);
    this.form = form;
  }

  createGrid(cell) {
    let grid = cell.attachGrid();
    grid.setHeader(`
      ${LANG['grid']['encoding']},
      ${LANG['grid']['result']}
    `);
    grid.setColTypes("ro,edtxt");
    grid.setColSorting('str,str');
    grid.setInitWidths("200,*");
    grid.setColAlign("center,left");
    grid.init();

    this.grid = grid;
  }
  bindToolbarClickHandler() {
    let self = this;
    let form = self.form;
    self.toolbar.attachEvent('onClick', (id)=>{
      switch (id) {
        case 'start':
        if(form.validate()) {
          var _formvals = form.getValues();
          let inputtext = _formvals['inputtext'];
          let griddata = [];
          self.support_encoding.map((encoding, i) => {
            let text = '';
            try {
              text = iconv.encode(Buffer.from(inputtext), encoding).toString();
            }catch (err) {
              text = '??????';
            }
            griddata.push({
              id: i + 1,
              data: [encoding, antSword.noxss(text)],
            });
          });
          self.grid.clearAll();
          self.grid.parse({
            rows: griddata,
          }, 'json');
          self.layout.cells('b').expand();
          toastr.success(LANG['success'], LANG_T['success']);
        }
        break;
        case 'reset':
          self.grid.clearAll();
          self.layout.cells('b').collapse();
          form.setItemValue('inputtext', '锘挎槬鐪犱笉瑙夋檽锛屽澶勯椈鍟奸笩');
        break;
        case 'online':
        antSword.shell.openExternal("http://www.mytju.com/classCode/tools/messyCodeRecover.asp");
        break;
      }
    });
  }
}

module.exports = Plugin;