
const { op } = require('sequelize');
const Ubuntu = require('../models/Ubuntu');



// create ubuntu
const addUbuntu = async (req, res) => {
   
  try {
    let info = req.body
    const ubuntu = await Ubuntu.create({...info}).then(ubuntu => {
      res.status(200).send(ubuntu);
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
    const ubuntu = await Ubuntu.findOne({ where: { ID: id } }).then(ubuntu => {
      res.status(200).send(ubuntu);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

};

const FindAllUbuntu = async (req, res) => {
  try {
    const ubuntu= await Ubuntu.findAll().then(ubuntu => {
      res.status(200).send(ubuntu);
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
    const ubuntu = await Ubuntu.update(info, { where: { ID: id } }).then(ubuntu => {
      res.status(200).send(ubuntu);
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
    const ubuntu = await Ubuntu.destroy({ where: { ID: id } })
    res.status(200).send(ubuntu);
    
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
