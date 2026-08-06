import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =====================================================
   CREATE SUPER ADMIN
===================================================== */

export const createSuperAdmin = async (req, res) => {

  try {

    const {
      name,
      pfNo,
      division,
      assignedDepots
    } = req.body;

    if (!name || !pfNo || !division) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }

    if (!assignedDepots || assignedDepots.length === 0) {
      return res.status(400).json({
        msg: "Assign at least one depot"
      });
    }

    const existingPF = await User.findOne({
      pfNo
    });

    if (existingPF) {
      return res.status(400).json({
        msg: "PF Number already exists"
      });
    }

    const existingDivision = await User.findOne({
      role: "SUPER_ADMIN",
      division
    });

    if (existingDivision) {
      return res.status(400).json({
        msg: "Super Admin already exists for this division"
      });
    }

    const hashedPassword = await bcrypt.hash(
      pfNo,
      10
    );

    const user = await User.create({

      name,

      pfNo,

      password: hashedPassword,

      role: "SUPER_ADMIN",

      division,

      assignedDepots,

      passwordChanged: false,

      createdBy: req.user.id

    });

    res.status(201).json({

      msg: "Super Admin created successfully",

      user

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};


/* =====================================================
   GET ALL SUPER ADMINS
===================================================== */

export const getAllSuperAdmins = async (req, res) => {

  try {

    const superAdmins = await User.find({

      role: "SUPER_ADMIN"

    })

      .select(
        "name pfNo division assignedDepots createdAt"
      )

      .sort({

        division: 1

      });

    res.json(superAdmins);

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};


/* =====================================================
   DASHBOARD SUMMARY
===================================================== */

export const dashboardSummary = async (req,res)=>{

try{

const [

superAdmins,

drivers,

managers,

adees

]=await Promise.all([

User.countDocuments({

role:"SUPER_ADMIN"

}),

User.countDocuments({

role:"DRIVER"

}),

User.countDocuments({

role:"DEPOT_MANAGER"

}),

User.countDocuments({

role:"ADEE"

})

]);

const divisions=

await User.aggregate([

{

$match:{

role:"SUPER_ADMIN"

}

},

{

$project:{

division:1,

assignedDepots:1

}

}

]);

res.json({

totalDivisions:divisions.length,

totalSuperAdmins:superAdmins,

totalDrivers:drivers,

totalManagers:managers,

totalADEE:adees,

divisions

});

}

catch(err){

res.status(500).json({

msg:err.message

});

}

}

/* =====================================================
   UPDATE SUPER ADMIN
===================================================== */

export const updateSuperAdmin = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      name,
      division,
      assignedDepots
    } = req.body;

    const superAdmin = await User.findOne({

      _id: id,

      role: "SUPER_ADMIN"

    });

    if (!superAdmin) {

      return res.status(404).json({

        msg: "Super Admin not found"

      });

    }

    /* ================================
       Prevent Duplicate Division
    ================================= */

    if (

      division &&

      division !== superAdmin.division

    ) {

      const existing = await User.findOne({

        role: "SUPER_ADMIN",

        division,

        _id: { $ne: id }

      });

      if (existing) {

        return res.status(400).json({

          msg: "Another Super Admin already exists for this division"

        });

      }

    }

    if (name)
      superAdmin.name = name;

    if (division)
      superAdmin.division = division;

    if (

      assignedDepots &&

      Array.isArray(assignedDepots)

    ) {

      superAdmin.assignedDepots =
        assignedDepots;

    }

    await superAdmin.save();

    res.json({

      msg: "Super Admin updated successfully",

      superAdmin

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};


/* =====================================================
   DELETE SUPER ADMIN
===================================================== */

export const deleteSuperAdmin = async (req, res) => {

  try {

    const { id } = req.params;

    const superAdmin = await User.findOne({

      _id: id,

      role: "SUPER_ADMIN"

    });

    if (!superAdmin) {

      return res.status(404).json({

        msg: "Super Admin not found"

      });

    }

    /* =====================================
       Check Child Users
    ====================================== */

    const users = await User.countDocuments({

      division: superAdmin.division,

      role: {

        $in: [

          "ADEE",

          "DEPOT_MANAGER",

          "DRIVER"

        ]

      }

    });

    if (users > 0) {

      return res.status(400).json({

        msg:
          "Cannot delete. Remove all users from this division first."

      });

    }

    await superAdmin.deleteOne();

    res.json({

      msg: "Super Admin deleted successfully."

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};

/* =====================================================
   SWITCH AS SUPER ADMIN
===================================================== */

export const switchToSuperAdmin = async (req, res) => {

  try {

    const { id } = req.params;

    const superAdmin = await User.findOne({

      _id: id,

      role: "SUPER_ADMIN"

    });

    if (!superAdmin) {

      return res.status(404).json({

        msg: "Super Admin not found"

      });

    }

    const token = jwt.sign(

      {

        id: superAdmin._id,

        role: superAdmin.role,

        division: superAdmin.division,

        assignedDepots:
          superAdmin.assignedDepots || []

      },

      process.env.JWT_SECRET,

      {

        expiresIn: "2h"

      }

    );

    res.json({

      msg: "Dashboard switched successfully",

      token,

      superAdmin:{

        id:superAdmin._id,

        name:superAdmin.name,

        division:superAdmin.division

      }

    });

  }

  catch(err){

    console.error(err);

    res.status(500).json({

      msg:err.message

    });

  }

};