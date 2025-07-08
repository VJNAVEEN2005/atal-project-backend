const Ecosystem = require('../models/ecosystemModel');

exports.getEcosystemData = async (req, res) => {
  try {
    const ecosystemData = await Ecosystem.findOne();

    if (!ecosystemData) {
      return res.status(404).json({
        success: false,
        message: "Ecosystem data not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ecosystem data fetched successfully",
      ecosystem: ecosystemData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

exports.updateEcosystemData = async (req, res) => {
  try {
    const ecosystemData = await Ecosystem.findOneAndUpdate({},
        {
            registeredMembers: req.body.registeredMembers,
            startupsSupported: req.body.startupsSupported,
            mentorsOnBoard: req.body.mentorsOnBoard,
            industrialPartnerships: req.body.industrialPartnerships,
            academicPartnerships: req.body.academicPartnerships,
            industryConsultingProjects: req.body.industryConsultingProjects,
            msmeSupport: req.body.msmeSupport,
            outreachInitiativesEvents: req.body.outreachInitiativesEvents,
            numberOfStartups: req.body.numberOfStartups,
            startupsGraduated: req.body.startupsGraduated,
            employmentGenerated: req.body.employmentGenerated,
            corpsFund: req.body.corpsFund,
            csrSecured: req.body.csrSecured 
        },
        { new: true, runValidators: true }
        );
    if (!ecosystemData) {
     // create ecosystem data if it doesn't exist
      const newEcosystemData = new Ecosystem({
        registeredMembers: req.body.registeredMembers || 0,
        startupsSupported: req.body.startupsSupported || 0,
        mentorsOnBoard: req.body.mentorsOnBoard || 0,
        industrialPartnerships: req.body.industrialPartnerships || 0,
        academicPartnerships: req.body.academicPartnerships || 0,
        industryConsultingProjects: req.body.industryConsultingProjects || 0,
        msmeSupport: req.body.msmeSupport || 0,
        outreachInitiativesEvents: req.body.outreachInitiativesEvents || 0,
        numberOfStartups: req.body.numberOfStartups || 0,
        startupsGraduated: req.body.startupsGraduated || 0,
        employmentGenerated: req.body.employmentGenerated || 0,
        corpsFund: req.body.corpsFund || 0,
        csrSecured: req.body.csrSecured || 0,
      });
      await newEcosystemData.save();
    }
    return res.status(200).json({
      success: true,
      message: "Ecosystem data updated successfully",
      ecosystem: ecosystemData
    });
    } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
    }
    }

