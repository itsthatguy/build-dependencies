jest.mock('../lib/runCommand');
let out = '';
global.console = {
  log: function (stuff) {
    out += strip(stuff + '\n');
  },
  error: console.error,
};

const deps = require('../lib');
const strip = require('strip-color');

describe('deps', function () {
  afterEach(function () {
    out = '';
  });

  it('requires arguments', function () {
    deps();
    expect(out).toContain("There's only one command: `deps install [GROUP_NAME]`");
  });

  it('requires a group name', function () {
    deps('install');
    expect(out).toContain("Please specify a group: `deps install [GROUP_NAME]`")
  });

  it('only installs groups that exist', function () {
    deps('install', 'build');
    expect(out).toContain("No buildDependencies found.");
  });

  it('installs test group dependencies', function () {
    deps('install', 'test');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    expect(out).toEqual('deps info resolve jest@^26.4.2\n' +
                        'deps warn resolve @babel/cli not found: installing latest\n' +
                        'deps cmd npm install jest@^26.4.2 @babel/cli\n' +
                        `${npmCmd} install jest@^26.4.2 @babel/cli\n`);
  });

  it('installs mixed group dependencies', function () {
    deps('install', 'mixed');
    expect(out).toEqual('deps info resolve jest@"^26.4.2"\n' +
                        'deps info resolve colors@"^1.4.0"\n' +
                        'deps cmd npm install jest@"^26.4.2" colors@"^1.4.0"\n' +
                        'npm install jest@"^26.4.2" colors@"^1.4.0"\n');
  });
});
