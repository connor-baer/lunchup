const fs = require('fs');
const _ = require('lodash');
const folder = 'storage/';

function readStorage(fileName) {
  if (fs.existsSync(folder + fileName + '.json')) {
    const data = JSON.parse(
      fs.readFileSync(folder + fileName + '.json', 'utf8')
    );
    return data;
  }
  return { [fileName]: [] };
}

function writeStorage(fileName, obj) {
  const data = JSON.stringify(obj);
  fs.writeFileSync(folder + fileName + '.json', data, 'utf8', error => {
    if (error) {
      return new Error("Writing the data to storage failed.");
    }
  });
}

module.exports = {
  getData(fileName) {
    return readStorage(fileName);
  },
  addItem(fileName, item) {
    return new Promise((resolve, reject) => {
      const currentData = readStorage(fileName)[fileName];
      const itemExists = currentData.find(value => value.id === item.id);

      if (!itemExists) {
        const withItem = _.concat(currentData, item);
        const newData = { [fileName]: withItem };
        writeStorage(fileName, newData);
        resolve("Item successfully added.");
      }
      reject("Item already exists.");
    })
  },
  // addItem(fileName, item) {
  //   const currentData = readStorage(fileName)[fileName];
  //   const itemExists = currentData.find(value => value.id === item.id);
  //   if (!itemExists) {
  //     const withItem = _.concat(currentData, item);
  //     const newData = { [fileName]: withItem };
  //     writeStorage(fileName, newData);
  //   }
  // },
  removeItem(fileName, id) {
    const currentData = readStorage(fileName)[fileName];
    const itemExists = currentData.find(value => value.id === id);
    if (itemExists) {
      const withoutItem = currentData.filter(value => id !== value.id);
      console.log(withoutItem);
      const newData = { [fileName]: withoutItem };

      writeStorage(fileName, newData);
    }
  },
  updateItem(fileName, id) {
    // TODO: Update items.
  }
};
