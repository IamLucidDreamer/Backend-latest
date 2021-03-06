/**
 * @author krish
 */

const classModel = require('../model/class')
const userModel = require('../model/user')
const { statusCode: SC } = require('../utils/statusCode')
const { loggerUtil: logger } = require('../utils/logger')
const { generateDocumentId } = require('../utils/generateId')

const createClass = async (req, res) => {
    let result = {
        docId: '',
        instructorId: '',
        instructorName: '',
        classname: '',
        date: '',
        location: '',
        noOfSpots: 0,
        students: []
    }
    const instructorId = req.params.instructorId
    const { classname, date, location, noOfSpots, students } = req.body
    try {
        await userModel
            .findOne({ _id: instructorId })
            .exec(async (err, data) => {
                if (err) {
                    logger(err, 'ERROR')
                }
                if (data) {
                    const prefix = 'CLS'
                    let suffix = 0
                    await classModel
                        .findOne({})
                        .sort({ createdAt: -1 })
                        .then((data) => {
                            if (data?.docId) {
                                suffix = parseInt(data.docId?.substr(3)) + 1
                            } else {
                                suffix = '000000'
                            }
                        })
                    result.docId = `${prefix}${generateDocumentId(suffix, 6)}`
                    result.instructorId = instructorId
                    result.instructorName = data.name
                    result.classname = classname
                    result.date = date ? date : null
                    result.location = location ? location : null
                    result.noOfSpots = noOfSpots ? noOfSpots : 0
                    result.students = students ? students : []

                    const newClass = new classModel(result)
                    newClass.save((err, data) => {
                        if (err) {
                            logger(err, 'ERROR')
                            return res.status(SC.BAD_REQUEST).json({
                                error: 'Creating Class in DB is failed!'
                            })
                        }
                        res.status(SC.OK).json({
                            message: 'Class created successfully!',
                            data: data
                        })
                    })
                } else {
                    res.status(SC.NOT_FOUND).json({
                        error: 'No Instructor found!'
                    })
                }
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Create Class Function is Executed!')
    }
}

const enrollStudents = async (req, res) => {
    const { students, classname } = req.body
    try {
        students === undefined
            ? res.status(SC.BAD_REQUEST).json({
                  error: 'Students is undefined'
              })
            : await classModel
                  .updateOne(
                      { _id: req.params.classId },
                      {
                          $push: {
                              students
                          }
                      }
                  )
                  .then(() => {
                      let ids = students.map((x) => x.studentId)
                      userModel
                          .updateMany(
                              { _id: { $in: ids } },
                              { $addToSet: { classAttended: classname } }
                          )
                          .then(() => {
                              res.status(SC.OK).json({
                                  message: 'Students enrolled successfully!'
                              })
                          })
                  })
                  .catch(() => {
                      res.status(SC.BAD_REQUEST).json({
                          error: 'Students enrollment Failed!'
                      })
                  })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Enroll Students Function is Executed!')
    }
}

const removeStudents = async (req, res) => {
    const { students, classname } = req.body
    try {
        await classModel
            .updateOne(
                { _id: req.params.classId },
                {
                    $pull: {
                        students: {
                            studentId: {
                                $in: students
                            }
                        }
                    }
                }
            )
            .then(() => {
                userModel
                    .updateMany(
                        { _id: { $in: students } },
                        { $pull: { classAttended: classname } }
                    )
                    .then(() => {
                        res.status(SC.OK).json({
                            message:
                                'Student removed successfully from this class!'
                        })
                    })
            })
            .catch((err) => {
                res.status(SC.BAD_REQUEST).json({
                    error: 'Removing student class is failed!'
                })
                logger(err, 'ERROR')
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Remove Students Function is Executed!')
    }
}

const updateClass = async (req, res) => {
    const { classname, instructor, date, location, noOfSpots } = req.body
    try {
        await userModel.findOne({ _id: instructor }).exec((err, data) => {
            if (err) {
                logger(err, 'ERROR')
            }
            if (data) {
                classModel
                    .updateOne(
                        { _id: req.params.classId },
                        {
                            $set: {
                                classname,
                                instructorId: instructor,
                                instructorName: data.name,
                                date,
                                location,
                                noOfSpots
                            }
                        }
                    )
                    .then(() => {
                        res.status(SC.OK).json({
                            message: 'Class updated successfully!'
                        })
                    })
                    .catch((err) => {
                        res.status(SC.BAD_REQUEST).json({
                            error: 'Class updation failed!'
                        })
                        logger(err, 'ERROR')
                    })
            } else {
                res.status(SC.NOT_FOUND).json({
                    error: 'No Instructor found!'
                })
            }
        })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Update Class Function is Executed!')
    }
}

const getClassById = async (req, res) => {
    try {
        await classModel
            .findOne({ _id: req.params.classId })
            .exec((err, data) => {
                if (err) {
                    logger(err, 'ERROR')
                }
                if (data) {
                    res.status(SC.OK).json({
                        message: 'Class fetched successfully!',
                        data: data
                    })
                } else {
                    res.status(SC.NOT_FOUND).json({
                        error: 'No Classes found!'
                    })
                }
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Get Class Function is Executed')
    }
}

const getAllClasses = async (req, res) => {
    try {
        await classModel
            .find({})
            .sort({ createdAt: -1 })
            .exec((err, data) => {
                if (err) {
                    logger(err, 'ERROR')
                }
                if (data) {
                    res.status(SC.OK).json({
                        message: 'Classes fetched successfully!',
                        data: data
                    })
                } else {
                    res.status(SC.NOT_FOUND).json({
                        error: 'No Classes found!'
                    })
                }
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Get All Classes Function is Executed')
    }
}

const getStudentClasses = async (req, res) => {
    const studentId = req.auth._id
    try {
        await classModel
            .find(
                {
                    students: {
                        $elemMatch: {
                            studentId: studentId
                        }
                    }
                },
                { students: 0, noOfSpots: 0 }
            )
            .exec((err, data) => {
                if (err) {
                    logger(err, 'ERROR')
                }
                if (data) {
                    res.status(SC.OK).json({
                        message: 'Student Classes fetched successfully!',
                        data: data
                    })
                } else {
                    res.status(SC.NOT_FOUND).json({
                        error: 'No Classes found!'
                    })
                }
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Get Student Classes Function is Executed')
    }
}

const deleteClassById = async (req, res) => {
    try {
        await classModel
            .findByIdAndDelete({ _id: req.params.classId })
            .exec((err, data) => {
                if (err) {
                    res.status(SC.BAD_REQUEST).json({
                        error: 'Deleting class from DB is failed!'
                    })
                    logger(err, 'ERROR')
                }
                if (data) {
                    res.status(SC.OK).json({
                        message: 'Class deleted successfully!'
                    })
                } else {
                    res.status(SC.NOT_FOUND).json({
                        error: 'No classes found!'
                    })
                }
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Delete Class Function is Executed!')
    }
}

const markAttendance = async (req, res) => {
    try {
        await classModel
            .updateOne(
                { 'students._id': req.params.id },
                {
                    $set: {
                        'students.$.attendence': req.body.attendence,
                        'students.$.note': req.body.note
                    }
                }
            )
            .then(() => {
                if (req.body.attendence) {
                    userModel
                        .updateOne(
                            { _id: req.params.studentId },
                            { $addToSet: { classAttended: req.body.className } }
                        )
                        .then(() => {
                            res.status(SC.OK).json({
                                message: 'Attendance marked successfully!'
                            })
                        })
                } else {
                    userModel
                        .updateOne(
                            { _id: req.params.studentId },
                            { $pull: { classAttended: req.body.className } }
                        )
                        .then(() => {
                            res.status(SC.OK).json({
                                message: 'Attendance marked successfully!'
                            })
                        })
                }
            })
            .catch((err) => {
                res.status(SC.BAD_REQUEST).json({
                    error: 'Marking attendance from DB is failed!'
                })
                logger(err, 'ERROR')
            })
    } catch (err) {
        logger(err, 'ERROR')
    } finally {
        logger('Mark Attendance Function is Executed!')
    }
}

module.exports = {
    createClass,
    enrollStudents,
    removeStudents,
    updateClass,
    getClassById,
    getAllClasses,
    getStudentClasses,
    deleteClassById,
    markAttendance
}
