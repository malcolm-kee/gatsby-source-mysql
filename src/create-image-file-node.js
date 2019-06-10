// Copied from gatsby-source-filesystem and modify
// This file need to be refactored once this PR is merged: https://github.com/gatsbyjs/gatsby/pull/14576
const fs = require(`fs-extra`);
const imageType = require(`image-type`);
const path = require(`path`);
const prettyBytes = require(`pretty-bytes`);
const slash = require(`slash`);

const { createContentDigest } = require(`./fallback`);

const CACHE_DIR = `.cache`;
const FS_PLUGIN_DIR = `gatsby-source-mysql`;

/**
 * createFilePath
 * --
 *
 * @param  {String} directory
 * @param  {String} filename
 * @param  {String} url
 * @return {String}
 */
const createFilePath = (directory, filename, ext) =>
  path.join(directory, `${filename}${ext}`);

async function saveBufferToCache(buffer, tmpFileName) {
  return new Promise((fulfill, reject) => {
    fs.writeFile(tmpFileName, buffer, err => {
      if (err) {
        return reject(err);
      }
      fulfill();
    });
  });
}

exports.createBufferFileNode = async function createBufferFileNode({
  buffer,
  createNodeId,
  fieldName,
  parentId,
  store
}) {
  // Ensure our cache directory exists.
  const pluginCacheDir = path.join(
    store.getState().program.directory,
    CACHE_DIR,
    FS_PLUGIN_DIR
  );
  await fs.ensureDir(pluginCacheDir);

  if (buffer && Buffer.isBuffer(buffer)) {
    const { ext, mime } = imageType(buffer);

    const digest = createContentDigest(buffer);

    const tmpFilename = createFilePath(pluginCacheDir, `tmp-${digest}`, ext);

    await saveBufferToCache(buffer, tmpFilename);

    const slashed = slash(tmpFilename);
    const parsedSlashed = path.parse(slashed);
    const slashedFile = {
      ...parsedSlashed,
      absolutePath: slashed
    };

    const internal = {
      contentDigest: digest,
      type: `MysqlImage`,
      mediaType: mime ? mime : `application/octet-stream`
    };
    return {
      id: createNodeId(`${parentId}-Image`),
      name: `${parentId}-${fieldName}`,
      children: [],
      parent: parentId,
      internal,
      extension: ext,
      size: buffer.length,
      prettySize: prettyBytes(buffer.length),
      absolutePath: slashedFile.absolutePath
    };
  }
  return null;
};
