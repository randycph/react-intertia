import React, { useMemo } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Table,
} from "react-bootstrap";
import { Head, Link, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import Layout from "../../Layouts";

type Student = {
  id: number;
  student_no: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: string;
};

type Enrollment = {
  id: number;
  student: Student;
};

type SchoolClass = {
  id: number;
  school_year: { name: string };
  section: { grade_level: number; name: string };
  subject: { name: string };
  teacher: { first_name: string; last_name: string };
};

interface RosterPageProps {
  class: SchoolClass;
  enrollments: Enrollment[];
}

const ClassRoster = () => {
  const { class: schoolClass, enrollments } =
    usePage<PageProps<RosterPageProps>>().props;

  return (
    <React.Fragment>
      <Head title="Class Roster | HS Admin" />

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {schoolClass.subject.name}
                      </h5>
                      <small className="text-muted">
                        {schoolClass.school_year.name} • Grade{" "}
                        {schoolClass.section.grade_level} -{" "}
                        {schoolClass.section.name} •{" "}
                        {schoolClass.teacher.last_name},{" "}
                        {schoolClass.teacher.first_name}
                      </small>
                    </div>

                    <Link
                      href="/admin/classes"
                      className="btn btn-light"
                    >
                      ← Back to Classes
                    </Link>
                  </div>
                </Card.Header>

                <Card.Body>
                  {enrollments.length > 0 ? (
                    <Table
                      className="align-middle table-nowrap"
                      responsive
                    >
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Student No</th>
                          <th>Name</th>
                          <th>Gender</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((e, index) => (
                          <tr key={e.id}>
                            <td>{index + 1}</td>
                            <td>{e.student.student_no}</td>
                            <td>
                              {e.student.last_name},{" "}
                              {e.student.first_name}{" "}
                              {e.student.middle_name ?? ""}
                            </td>
                            <td>
                              {e.student.gender
                                ? e.student.gender.charAt(0).toUpperCase() +
                                  e.student.gender.slice(1)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-user-line fs-1 mb-3 d-block"></i>
                      <h5>No students enrolled</h5>
                      <p>
                        This class currently has no enrolled students.
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

ClassRoster.layout = (page: any) => <Layout children={page} />;
export default ClassRoster;
