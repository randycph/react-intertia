import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, Container, Table, Form, Badge, Row, Col } from "react-bootstrap";
import Layout from "../../Layouts";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
};

type Enrollment = {
  student: Student;
};

const ScoresIndex = () => {
  const { activity, students, scores } = usePage().props as any;

  const maxScore = activity.max_score;

  const handleSave = (studentId: number, value: string, ev: React.FocusEvent<HTMLInputElement>) => {
    if (value === "") return;

    const score = Number(value);

    if (score < 0 || score > maxScore) {
      alert(`Score must be between 0 and ${maxScore}`);
      // clear
      ev.target.value = "";
      return;
    }

    router.post(
      `/admin/activities/${activity.id}/scores`,
      {
        student_id: studentId,
        score: score,
      },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <>
      <Head title="Enter Scores" />

      <div className="page-content">
        <Container fluid>
            <Row>
              <Col xl={12}>
                <Card>
                  {/* HEADER */}
                  <Card.Header>
                    <h5 className="mb-1">
                      Scores — {activity.name}
                    </h5>
                    <small className="text-muted">
                      School Year: {activity.grading_period.semester.school_year.name} |
                      Grade {activity.classes.section.grade_level} –{" "}
                      {activity.classes.section.name} |
                      Subject: {activity.classes.subject?.name} |
                      Teacher: {activity.classes.teacher?.first_name}{" "}
                      {activity.classes.teacher?.last_name} |
                      {activity.grading_period.semester.name} –{" "}
                      {activity.grading_period.name} |
                      Max Score: {activity.max_score}
                    </small>
                  </Card.Header>

                  {/* TABLE */}
                  <Card.Body>
                    <Table className="align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th style={{ width: "120px" }}>Score</th>
                          <th>Max</th>
                          <th>%</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((e: Enrollment) => {
                          const score = scores[e.student.id]?.score;
                          const percent =
                            score !== undefined
                              ? Math.round((score / maxScore) * 100)
                              : null;

                          return (
                            <tr key={e.student.id}>
                              <td>
                                {e.student.last_name}, {e.student.first_name}
                              </td>

                              <td>
                                <Form.Control
                                  type="number"
                                  defaultValue={score ?? ""}
                                  min={0}
                                  max={maxScore}
                                  onBlur={(ev) =>
                                    handleSave(
                                      e.student.id,
                                      ev.target.value
                                    )
                                  }
                                />
                              </td>

                              <td>{maxScore}</td>

                              <td>{percent !== null ? `${percent}%` : "—"}</td>

                              <td>
                                {score === undefined ? (
                                  <Badge bg="secondary-subtle" text="secondary">
                                    No Entry
                                  </Badge>
                                ) : percent! >= 75 ? (
                                  <Badge bg="success-subtle" text="success">
                                    Pass
                                  </Badge>
                                ) : (
                                  <Badge bg="danger-subtle" text="danger">
                                    Fail
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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

ScoresIndex.layout = (page: any) => <Layout children={page} />;
export default ScoresIndex;
