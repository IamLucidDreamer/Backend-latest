/**
 * @author krish
 */

const express = require('express')
const router = express.Router()
const {
    createBucket,
    updateBucket,
    updateBucketStatus,
    getBucketById,
    getAllBuckets,
    deleteBucketById,
    enrollStudents,
    removeStudents
} = require('../controller/bucket')
const {
    isSignedIn,
    isValidToken,
    isAdminOrInstructor
} = require('../controller/middleware')

router.post(
    '/bucket/create/:userId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    createBucket
)

router.put(
    '/bucket/update/:bucketId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    updateBucket
)

router.put(
    '/bucket/update-status/:bucketId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    updateBucketStatus
)

router.get('/bucket/get/:bucketId', isSignedIn, isValidToken, getBucketById)

router.put(
    '/bucket/enroll/:bucketId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    enrollStudents
)

router.put(
    '/bucket/remove-student/:bucketId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    removeStudents
)

router.get(
    '/bucket/get-all',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    getAllBuckets
)

router.delete(
    '/bucket/delete/:bucketId',
    isSignedIn,
    isValidToken,
    isAdminOrInstructor,
    deleteBucketById
)

module.exports = router
