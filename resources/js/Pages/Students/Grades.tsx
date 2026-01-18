import React from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Table,
} from "react-bootstrap";
import { Head, usePage, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import Layout from "../../Layouts";

type GradeRow = {
  subject: string;
  final_grade: number | null;
};

interface GradesPageProps {
  student: {
    id: number;
    student_no: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  schoolYear: {
    id: number;
    name: string;
  } | null;
  grades: GradeRow[];
}

const StudentGrades = () => {
  const { student, schoolYear, grades } =
    usePage<PageProps<GradesPageProps>>().props;

  return (
    <React.Fragment>
      <Head title="Student Grades | HS Admin" />

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {student.last_name},{" "}
                        {student.first_name}{" "}
                        {student.middle_name ?? ""}
                      </h5>
                      <small className="text-muted">
                        Student No: {student.student_no}
                        {schoolYear && ` • ${schoolYear.name}`}
                      </small>
                    </div>

                    <Link
                      href="/admin/students"
                      className="btn btn-light"
                    >
                      ← Back to Students
                    </Link>
                  </div>
                </Card.Header>

                <Card.Body>
                  {grades.length > 0 ? (
                    <Table
                      responsive
                      className="align-middle table-nowrap"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Subject</th>
                          <th width="180">Final Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g, index) => (
                          <tr key={index}>
                            <td>{g.subject}</td>
                            <td>
                              {g.final_grade !== null ? (
                                <span className="fw-semibold">
                                  {g.final_grade}%
                                </span>
                              ) : (
                                <span className="text-muted">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-file-list-3-line fs-1 mb-3 d-block"></i>
                      <h5>No grades available</h5>
                      <p>
                        This student has no grades for the
                        selected school year.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

StudentGrades.layout = (page: any) => <Layout children={page} />;
export default StudentGrades;
