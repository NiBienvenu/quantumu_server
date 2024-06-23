
const { op } = require('sequelize');



// create contact
const addUbuntu = async (req, res) => {
   
  try {
    let info = req.body
    Conta.create({...info}).then(cont => {
      res.status(200).send(info);
      console.log(info)
    })
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const ShowOneUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    Conta.findOne({ where: { ID: id } }).then(cont => {
      res.status(200).send(cont);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

};

const FindAllUbuntu = async (req, res) => {
  try {
    Conta.findAll().then(cont => {
      res.status(200).send(cont);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const UpdateUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    let info = req.body;
    Conta.update(info, { where: { ID: id } }).then(cont => {
      res.status(200).send(cont);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const DeleteUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    Conta.destroy({ where: { ID: id } }).then(cont => {
      res.status(200).send(cont);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
}


module.exports = {
  addUbuntu,
  ShowOneUbuntu,
  FindAllUbuntu,
  UpdateUbuntu,
  DeleteUbuntu,

};