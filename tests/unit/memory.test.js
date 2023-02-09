const memory = require('../../src/model/data/memory/index.js');
const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('checking index.js file of memory-db', () => {
  let db;
  beforeEach(() => {
    db = new MemoryDB();
  });

  // test for readFragment function
  test('checking readFragment function', async () => {
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const fragment = await memory.readFragment('a', 'b');
    expect(fragment).tobetrue;
  });

  // test for writeFragment function
  test('checking writeFragment function', async () => {
    const data = { ownerId: 'a', id: 'b', value: 123 };
    const fragment = await memory.writeFragment(data);
    expect(fragment).tobetrue;
  });

  //test for readFragmentData function
  test('checking readFragmentData function', async () => {
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const fragment = await memory.readFragmentData('a', 'b');
    expect(fragment).tobetrue;
  });

  //test for writeFragmentData function
  test('checking writeFragmentData function', async () => {
    const data = { value: 123 };
    const fragment = await memory.writeFragmentData('a', 'b', data);
    expect(fragment).tobetrue;
  });
});
