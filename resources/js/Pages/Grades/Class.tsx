import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import { Card, Container, Table, Badge, Col, Row } from "react-bootstrap";
import Layout from "../../Layouts";

const ClassGrades = () => {
  const { class: schoolClass, gradingPeriods, rows } = usePage().props as any;

  const badgeForStatus = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge bg="success-subtle" text="success">
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge bg="danger-subtle" text="danger">
            Failed
          </Badge>
        );
      case "incomplete":
        return (
          <Badge bg="warning-subtle" text="warning">
            Incomplete
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary-subtle" text="secondary">
            —
          </Badge>
        );
    }
  };

  return (
    <>
      <Head title="Class Grades" />

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5>{schoolClass.subject.name} — Class Grades</h5>
                      <small className="text-muted">
                        {schoolClass.section.grade_level} –{" "}
                        {schoolClass.section.name} | SY{" "}
                        {schoolClass.school_year.name}
                      </small>
                    </div>
                    <div>
                      <Link href="/admin/classes" className="btn btn-light">
                        ← Back to Classes
                      </Link>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body>
                  <Table bordered hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        {gradingPeriods.map((gp: any) => (
                          <th key={gp.id}>{gp.name}</th>
                        ))}
                        <th>Final</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row: any) => (
                        <tr key={row.student.id}>
                          <td>
                            <Link
                              href={`/admin/students/${row.student.id}/grades`}
                              className="text-decoration-none"
                            >
                              {row.student.name}
                            </Link>
                          </td>

                          {gradingPeriods.map((gp: any) => (
                            <td key={gp.id}>{row.periods[gp.id] ?? "—"}</td>
                          ))}

                          <td>{row.final ?? "—"}</td>

                          <td>{badgeForStatus(row.status)}</td>
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
    </>
  );
};

ClassGrades.layout = (page: any) => <Layout children={page} />;
export default ClassGrades;
