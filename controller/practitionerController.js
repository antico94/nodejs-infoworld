const {
  isPractitionerActive,
  isPractitioner,
  isIdUnique,
  addPractitionerToDatabase,
  getContentType,
  getFullName,
  getFacilityList,
  isIdPresent,
  convertToJson,
  showActiveMedics,
  isIdAndNameValid,
  isAuthorised,
  isMedicFacilityJson,
  isMedicFacilityCsv,
} = require('../utils/utilsPractitioner');

const practitionerController = (app) => {
  app.post('/practitioners', (req, res) => {
    if (isAuthorised(req.headers)) {
      if (getContentType(req.headers) === 'application/json') {
        if (isMedicFacilityJson(req.body, req.headers)) {
          if (isIdPresent(req.body) && isPractitioner(req.body)) {
            if (isIdUnique(req.body.id)) {
              addPractitionerToDatabase(req.body);
            } else {
              return res.status(400).send({
                error: 'The id is already in the database.',
              });
            }

            if (isPractitionerActive(req.body)) {
              return res.status(200).send({
                name: getFullName(req.body), message: getFacilityList(req.body),
              });
            }

          } else {
            return res.status(400).send({
              error: 'The request body is missing id or the resourceType is not practitioner.',
            });
          }
        }
      } else if (getContentType(req.headers) === 'text/csv') {
        const json = convertToJson(req.body);
        if (isMedicFacilityCsv(json, req.headers)) {
          showActiveMedics(json);
          if (isIdAndNameValid(json)) {
            return res.status(200).send({
              salut: 'there',
            });
          } else {
            return res.status(400).send({
              error: 'A medic cannot have more than one ID.',
            });
          }
        }
      }

    } else {
      res.send({
        error: 'Only admins or practitioners are allowed.',
      });
    }

  });
};

module.exports = practitionerController;