import React, { useState } from "react";
import {
  Card,
  Container,
  Table,
  Form,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import { Head, router, usePage } from "@inertiajs/react";
import Layout from "../../Layouts";
import ConfirmActionModal from "../../Components/Common/ConfirmActionModal";
import { PageProps } from "@inertiajs/inertia";

type Enrollment = {
  id: number;
  is_promoted: boolean;
  student: {
    first_name: string;
    last_name: string;
  };
  section: {
    grade_level: number;
    name: string;
  };
  eligible: boolean; // sent from backend
};

type Section = {
  id: number;
  grade_level: number;
  name: string;
};

interface PromotionPageProps extends PageProps {
  enrollments: Enrollment[];
  sections: Section[];
  nextYear: { id: number; name: string; is_locked: boolean } | null;
  sourceYear: { id: number; name: string } | null;
  targetYear: { id: number; name: string } | null;
}

const PromotionIndex = () => {
  const { enrollments, sections, nextYear, sourceYear, targetYear } =
    usePage<PageProps<PromotionPageProps>>().props;

  // enrollment_id => next_section_id
  const [selections, setSelections] = useState<Record<number, number>>({});

  // undo modal
  const [undoModal, setUndoModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);

  const handlePromote = () => {
    const payload = Object.entries(selections).map(
      ([enrollmentId, sectionId]) => ({
        enrollment_id: Number(enrollmentId),
        next_section_id: sectionId,
      })
    );

    if (payload.length === 0) {
      alert("Select at least one eligible student.");
      return;
    }

    router.post("/admin/promotion", {
      next_school_year_id: nextYear?.id,
      enrollments: payload,
    });
  };

  return (
    <div>
      <Head title="Promotion" />
      <div className="page-content">
        <Container fluid>
            <Row>
              <Col xl={12}>
                <Card>
                  <Card.Header>

                    <div className="alert alert-info">
                      <strong>Promotion Source:</strong> {sourceYear?.name} (Locked)<br />
                      <strong>Promotion Target:</strong> {targetYear?.name} (Active)
                    </div>
                    <h5 className="mb-0">
                      Student Promotion
                      {nextYear && ` — Next SY: ${nextYear.name}`}
                    </h5>

                  </Card.Header>

                  <Card.Body className="pt-0">
                    {!nextYear && (
                      <div className="alert alert-warning">
                        Please create and activate the next school year before
                        promoting students.
                      </div>
                    )}

                    <Table className="align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Current Section</th>
                          <th>Promoted To</th>
                          <th>Eligibility</th>
                          <th>Next Section</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((e) => (
                          <tr key={e.id}>
                            <td>
                              {e.student.last_name}, {e.student.first_name}
                            </td>

                            <td>
                              Grade {e.section.grade_level} - {e.section.name}
                            </td>
                            <td>
                              {e.promoted_to
                                ? `Grade ${e.promoted_to.grade_level} - ${e.promoted_to.name}`
                                : "—"}
                            </td>


                            <td>
                              {e.eligible ? (
                                <Badge bg="success-subtle" text="success">
                                  Eligible
                                </Badge>
                              ) : (
                                <Badge bg="danger-subtle" text="danger">
                                  Not Eligible
                                </Badge>
                              )}
                            </td>

                            <td>
                              <Form.Select
                                disabled={
                                  !e.eligible ||
                                  e.is_promoted ||
                                  !nextYear
                                }
                                value={selections[e.id] ?? ""}
                                onChange={(ev) =>
                                  setSelections((prev) => ({
                                    ...prev,
                                    [e.id]: Number(ev.target.value),
                                  }))
                                }
                              >
                                <option value="">Select</option>
                                {sections
                                  .filter(
                                    (s) =>
                                      s.grade_level ===
                                      e.section.grade_level + 1
                                  )
                                  .map((s) => (
                                    <option key={s.id} value={s.id}>
                                      Grade {s.grade_level} - {s.name}
                                    </option>
                                  ))}
                              </Form.Select>
                            </td>

                            <td>
                              {e.is_promoted ? (
                                <Badge bg="info-subtle" text="info">
                                  Promoted
                                </Badge>
                              ) : (
                                <Badge bg="secondary-subtle" text="secondary">
                                  Not Promoted
                                </Badge>
                              )}
                            </td>

                            <td>
                              {e.is_promoted && !nextYear?.is_locked ? (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setSelectedEnrollment(e);
                                      setUndoModal(true);
                                    }}
                                >
                                  Undo
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <div className="text-end mt-3">
                      <button
                        className="btn btn-success"
                        disabled={!nextYear}
                        onClick={handlePromote}
                      >
                        Promote Selected
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
        </Container>
      </div>

      {/* Undo Promotion Modal */}
      <ConfirmActionModal
        show={undoModal}
        title="Undo Promotion"
        message="This will remove the student's enrollment for the next school year and restore their previous status. This action is not allowed once the next school year is locked."
        icon="ri-arrow-go-back-line"
        iconColor="text-danger"
        confirmText="Yes, Undo Promotion"
        confirmButtonClass="btn-danger"
        onConfirm={() => {
          if (selectedEnrollment) {
            router.post("/admin/promotion/undo", {
              enrollment_id: selectedEnrollment.id,
            });
          }
          setUndoModal(false);
        }}
        onClose={() => setUndoModal(false)}
      />
    </div>
  );
};

PromotionIndex.layout = (page: any) => <Layout children={page} />;
export default PromotionIndex;
