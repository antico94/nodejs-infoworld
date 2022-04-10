const database = require('../db/db');
const _ = require('underscore');

const isPractitionerActive = (body) => {
  return body.active;
};

const getContentType = (headers) => {
  return headers['content-type'];
};

const isIdUnique = (id) => {
  if (database.length === 0) {
    return true;
  } else {
    return typeof database.find(practitioner => {
      return practitioner.id === id;
    }) === 'undefined';
  }
};

const isPractitioner = (body) => {
  return body.resourceType === 'Practitioner';
};

const addPractitionerToDatabase = (practitioner) => {
  database.push(practitioner);
};

const getFullName = (practitioner) => {
  return practitioner.name[0].text;
};

const getFacilityList = (body) => {
  let facilities = [];
  body.facility.forEach(facility => {
    facilities.push(facility.name);
  });
  return facilities;
};

const isIdPresent = (body) => {
  return body.id !== undefined && body.id !== '';
};

const convertToJson = (data) => {
  let trimmed = data.split('text/csv')[1].split(
      '----------------------------')[0].split('\n');
  let extracted = [];
  trimmed.forEach(row => {
    if (row.length > 10) {
      extracted.push(row.replace('\r', ''));
    }
  });

  let result = [];
  let headers = extracted[0].split(', ');
  for (let i = 1; i < extracted.length; i++) {

    let obj = {};
    let currentLine = extracted[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j].replace(' ', '');
    }
    result.push(obj);
  }
  return result;
};

const showActiveMedics = (json) => {
  let activeList = [];
  json.forEach(el => {
    if (el.Active === 'true') {
      let obj = {};
      let fullName = el.FamilyName + ' ' + el.GivenName;
      obj[fullName] = [el.NameId];

      if (activeList.findIndex(el => el.hasOwnProperty(fullName)) !== -1) {
        let currentList = activeList[activeList.findIndex(
            el => el.hasOwnProperty(fullName))][fullName];
        currentList.push(el.NameId);
        activeList[activeList.findIndex(
            el => el.hasOwnProperty(fullName))][fullName] = currentList;

      } else {
        activeList.push(obj);
      }

    }
  });
  console.log('***** ACTIVE MEDICS *****');
  activeList.forEach(medic => {console.log(medic);});
};

const isIdAndNameValid = (json) => {
  let result = true;
  json.forEach(medic => {
    let name = medic.FamilyName + ' ' + medic.GivenName;
    let id = medic.ID;
    json.forEach(compareMedic => {
      if (compareMedic.FamilyName + ' ' + compareMedic.GivenName === name) {
        if (compareMedic.ID !== id) {
          result = false;
        }
      }
    });
  });
  return result;
};

const decodeBase64 = (encodedKey) => {
  let buff = Buffer.from(encodedKey, 'base64');
  return JSON.parse(buff.toString('ascii').replace('"roles"', ',"roles"'));
};

const isAuthorised = (headers) => {
  let decoded = decodeBase64(headers['x-vamf-jwt']);
  return decoded.roles.includes('Admin') ||
      decoded.roles.includes('Practitioner');
};

const isMedicFacilityCsv = (csv, headers) => {
  let allowedFacilities = decodeBase64(headers['x-vamf-jwt']).facility;
  let medicFacilities = csv.map(({facility}) => ({facility}));
  medicFacilities = _.keys(_.countBy(medicFacilities,
      function(medicFacilities) { return medicFacilities.FacilityId; }));
  return medicFacilities.some(i => allowedFacilities.includes(i));
};

const isMedicFacilityJson = (json, headers) => {
  let allowedFacilities = decodeBase64(headers['x-vamf-jwt']).facility;
  let medicFacilities = json.facility;
  medicFacilities = _.keys(_.countBy(medicFacilities,
      function(medicFacilities) { return medicFacilities.value; }));
  return medicFacilities.some(i => allowedFacilities.includes(i));
};

module.exports = {
  isAuthorised,
  isIdAndNameValid,
  showActiveMedics,
  isIdUnique,
  isPractitionerActive,
  addPractitionerToDatabase,
  getContentType,
  getFullName,
  getFacilityList,
  isIdPresent,
  isPractitioner,
  convertToJson,
  isMedicFacilityCsv,
  isMedicFacilityJson,
};