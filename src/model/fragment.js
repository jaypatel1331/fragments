// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  // constructor check for the required fields and throws an error if they are missing
  constructor({ id, ownerId, created = new Date(), updated = new Date(), type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error(`ownerId and type are required`);
    }
    if (size < 0 || typeof size != 'number') {
      throw new Error(`size should be a number and cannot be negative`);
    }
    if (
      type != 'text/plain' &&
      type != 'text/plain; charset=utf-8' &&
      type != 'text/html' &&
      type != 'text/markdown' &&
      type != 'application/json'
    ) {
      throw new Error(`this type is not supported`);
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || created.toISOString();
    this.updated = updated || updated.toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`${id} not found`);
    }
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    return await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error(`data is not a buffer`);
    }
    this.size = Buffer.byteLength(data);
    await this.save();
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    if (/(text\/)/.test(this.mimeType)) {
      return true;
    }
    return false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const plainType = ['text/plain'];
    const markType = ['text/plain', 'text/markdown', 'text/html'];
    const htmlType = ['text/html', 'text/plain'];
    const jsonType = ['application/json', 'text/plain'];
    switch (this.mimeType) {
      case 'text/plain':
        return plainType;
      case 'text/markdown':
        return markType;
      case 'text/html':
        return htmlType;
      case 'application/json':
        return jsonType;
      default:
        return [this.mimeType];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    if (
      value === 'text/plain' ||
      value === 'text/plain; charset=utf-8' ||
      value === 'text/html' ||
      value === 'text/markdown' ||
      value === 'application/json'
    ) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
