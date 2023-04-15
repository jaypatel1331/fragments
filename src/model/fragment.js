// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')();
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// Fragment class
class Fragment {
  // constructor check for the required fields and throws an error if they are missing
  constructor({
    id,
    ownerId,
    created = new Date().toISOString(),
    updated = new Date(),
    type,
    size = 0,
  }) {
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
      type != 'application/json' &&
      type != 'image/png' &&
      type != 'image/jpeg' &&
      type != 'image/webp' &&
      type != 'image/gif'
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

  async setData(data) {
    try {
      if (!data) {
        return Promise.reject(new Error('cannot add data to fragment, no data received'));
      }
      this.updated = new Date().toISOString();
      this.size = data.length;
      await writeFragment(this);
      return writeFragmentData(this.ownerId, this.id, data);
    } catch (err) {
      Promise.reject(err);
    }
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
    const imageType = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    switch (this.mimeType) {
      case 'text/plain':
        return plainType;
      case 'text/markdown':
        return markType;
      case 'text/html':
        return htmlType;
      case 'application/json':
        return jsonType;
      case 'image/png':
        return imageType;
      case 'image/jpeg':
        return imageType;
      case 'image/gif':
        return imageType;
      case 'image/webp':
        return imageType;
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
      value === 'application/json' ||
      value === 'image/png' ||
      value === 'image/jpeg' ||
      value === 'image/webp' ||
      value === 'image/gif'
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Converts the fragment's data to the given type
   * @param {string} type the type to convert to
   * @returns {Promise<Buffer>} the converted data
   * @throws {Error} if the type is not supported
   **/

  convertData(data, type) {
    switch (type) {
      case 'text/html':
        if (this.type === 'text/markdown') {
          return md.render(data.toString());
        }
        return data;
      case 'image/png':
        return sharp(data).toFormat('png');
      case 'image/jpeg':
        return sharp(data).toFormat('jpg').toBuffer();
      case 'image/gif':
        return sharp(data).toFormat('gif');
      case 'image/webp':
        return sharp(data).toFormat('webp');
      case 'text/plain':
        return data.toString();
      default:
        return data;
    }
  }
}

module.exports.Fragment = Fragment;
