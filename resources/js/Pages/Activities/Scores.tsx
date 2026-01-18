import React, { useMemo } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import Layout from "../../Layouts";

type Student = {
  id: number;
  student_no: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
};

type Enrollment = {
  id: number;
  student: Student;
};

type Activity = {
  id: number;
  name: string;
  type: string;
  max_score: number;
  is_published: boolean;
  class: {
    id: number;
    subject: { name: string };
    section: { grade_level: number; name: string };
  };
};

type Score = {
  student_id: number;
  score: number | null;
};

interface ScoresPageProps {
  activity: Activity;
  enrollments: Enrollment[];
  scores: Record<number, Score>;
}

const ActivityScores = () => {
  const { activity, enrollments, scores } =
    usePage<PageProps<ScoresPageProps>>().props;

  const [form, setForm] = React.useState<Record<number, number | "">>(() => {
    const initial: any = {};
    enrollments.forEach((e) => {
      initial[e.student.id] =
        scores[e.student.id]?.score ?? "";
    });
    return initial;
  });

  const handleChange = (studentId: number, value: string) => {
    const num =
      value === "" ? "" : Math.min(Number(value), activity.max_score);
    setForm({ ...form, [studentId]: num });
  };

  const handleSave = () => {
    const payload = Object.keys(form).map((studentId) => ({
      student_id: Number(studentId),
      score:
        form[Number(studentId)] === ""
          ? null
          : Number(form[Number(studentId)]),
    }));

    router.post(`/admin/activities/${activity.id}/scores`, {
      scores: payload,
    });
  };

  return (
    <React.Fragment>
      <Head title="Activity Scores | HS Admin" />

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{activity.name}</h5>
                      <small className="text-muted">
                        {activity.class.subject.name} • Grade{" "}
                        {activity.class.section.grade_level}-
                        {activity.class.section.name} • Max{" "}
                        {activity.max_score}
                      </small>
                    </div>

                    <Link
                      href={`/admin/classes/${activity.class.id}/activities`}
                      className="btn btn-light"
                    >
                      ← Back to Activities
                    </Link>
                  </div>
                </Card.Header>

                <Card.Body>
                  {enrollments.length > 0 ? (
                    <Table responsive className="table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Student No</th>
                          <th>Name</th>
                          <th width="150">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((e, index) => (
                          <tr key={e.student.id}>
                            <td>{index + 1}</td>
                            <td>{e.student.student_no}</td>
                            <td>
                              {e.student.last_name},{" "}
                              {e.student.first_name}{" "}
                              {e.student.middle_name ?? ""}
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                min={0}
                                max={activity.max_score}
                                value={form[e.student.id]}
                                disabled={activity.is_published}
                                onChange={(ev) =>
                                  handleChange(
                                    e.student.id,
                                    ev.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-user-line fs-1 mb-3 d-block"></i>
                      <h5>No enrolled students</h5>
                      <p>
                        There are no students enrolled in this
                        class.
                      </p>
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="text-end">
                  {!activity.is_published && (
                    <button
                      className="btn btn-success"
                      onClick={handleSave}
                    >
                      Save Scores
                    </button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

ActivityScores.layout = (page: any) => <Layout children={page} />;
export default ActivityScores;
