const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authmiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - age
 *         - major
 *         - gpa
 *         - graduationYear
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the student
 *         lastName:
 *           type: string
 *           description: Last name of the student
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (unique)
 *         age:
 *           type: integer
 *           minimum: 16
 *           maximum: 100
 *           description: Age of the student
 *         major:
 *           type: string
 *           description: Major field of study
 *         gpa:
 *           type: number
 *           minimum: 0
 *           maximum: 4
 *           description: Grade Point Average
 *         graduationYear:
 *           type: integer
 *           description: Year of graduation
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@byui.edu
 *         age: 20
 *         major: Computer Science
 *         gpa: 3.5
 *         graduationYear: 2025
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error or duplicate email
 */
router.route('/')
  .get(protect, getStudents)
  .post(protect, adminOnly, createStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Student not found
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error, invalid ID, or duplicate email
 *       404:
 *         description: Student not found
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Student not found
 */
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

module.exports = router;
