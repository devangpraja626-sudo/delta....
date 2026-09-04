const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);


// Automatically keep the creator as a member
groupSchema.pre("save", function (next) {
    if (
        this.createdBy &&
        !this.members.some(
            member =>
                member.toString() === this.createdBy.toString()
        )
    ) {
        this.members.push(this.createdBy);
    }

    next();
});


module.exports = mongoose.model("Group", groupSchema);