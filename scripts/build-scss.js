const sass = require('node-sass');
const fs = require('fs');

const SCSS_FILE = './projects/angular2-draggable/src/scss/resizable.scss';
const SCSS_FILE2 = './projects/angular2-draggable/src/scss/resizable-table.scss';
const SCSS_FILE3 = './projects/angular2-draggable/src/scss/closable.scss';
const OUTPUT_PATH = './dist/angular2-draggable/css';

const resultResizable = sass.renderSync({
  file: SCSS_FILE,
  outputStyle: 'expanded'
});

const minResultResizable = sass.renderSync({
  file: SCSS_FILE,
  outputStyle: 'compressed'
});

const resultResizableTable = sass.renderSync({
  file: SCSS_FILE2,
  outputStyle: 'expanded'
});

const minResultResizableTable = sass.renderSync({
  file: SCSS_FILE2,
  outputStyle: 'compressed'
});

const resultClosable = sass.renderSync({
  file: SCSS_FILE3,
  outputStyle: 'expanded'
});

const minResultClosable = sass.renderSync({
  file: SCSS_FILE3,
  outputStyle: 'compressed'
});

try {
  fs.mkdirSync(OUTPUT_PATH);
} catch(e) {
  // no need
}
fs.writeFileSync(OUTPUT_PATH + '/resizable.css', resultResizable.css);
fs.writeFileSync(OUTPUT_PATH + '/resizable.min.css', minResultResizable.css);
fs.writeFileSync(OUTPUT_PATH + '/resizable-table.css', resultResizableTable.css);
fs.writeFileSync(OUTPUT_PATH + '/resizable-table.min.css', minResultResizableTable.css);
fs.writeFileSync(OUTPUT_PATH + '/closable.css', resultClosable.css);
fs.writeFileSync(OUTPUT_PATH + '/closable.min.css', minResultClosable.css);
