import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { Card, Container, Table, Badge, Col, Row } from "react-bootstrap";
import Layout from "../../Layouts";

const StudentGrades = () => {
  const { student, enrollment, gradingPeriods, grades } =
    usePage().props as any;

  return (
    <div>
      <Head title="Student Grades" />

      <div className="page-content">
      <Container fluid>
        <Row>
            <Col xl={12}>
            <Card>
            <Card.Header>
                <h5>
                Grades — {student.last_name}, {student.first_name}
                </h5>
                <small className="text-muted">
                School Year: {enrollment.school_year.name} | Grade{" "}
                {enrollment.section.grade_level} – {enrollment.section.name}
                </small>
            </Card.Header>

            <Card.Body>
                <Table bordered className="align-middle">
                <thead className="table-light">
                    <tr>
                    <th>Subject</th>
                    {gradingPeriods.map((gp: any) => (
                        <th key={gp.id}>{gp.name}</th>
                    ))}
                    <th>Final</th>
                    <th>Remarks</th>
                    </tr>
                </thead>

                <tbody>
                    {grades.map((g: any, i: number) => (
                    <tr key={i}>
                        <td>{g.subject}</td>

                        {gradingPeriods.map((gp: any) => (
                        <td key={gp.id}>
                            {g.periods[gp.id] ?? "—"}
                        </td>
                        ))}

                        <td>{g.final ?? "—"}</td>

                        <td>
                        {g.final !== null && g.final >= 75 ? (
                            <Badge bg="success-subtle" text="success">
                            Passed
                            </Badge>
                        ) : (
                            <Badge bg="danger-subtle" text="danger">
                            Failed
                            </Badge>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            </Card.Body>
            </Card>
            </Col>
        </Row>
      </Container>
      </div>
    </div>
  );
};

StudentGrades.layout = (page: any) => <Layout children={page} />;
export default StudentGrades;
