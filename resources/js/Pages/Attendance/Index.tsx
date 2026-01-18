import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, Link, useForm, router } from "@inertiajs/react";
import {
  Card,
  Container,
  Table,
  Col,
  Row,
  Button,
  Form,
} from "react-bootstrap";
import Layout from "../../Layouts";
import ConfirmActionModal from "../../Components/Common/ConfirmActionModal";

const ClassAttendance = () => {
  const {
    class: schoolClass,
    date,
    students,
    canMarkAttendance,
  } = usePage().props as any;

  const { data, setData, post, processing } = useForm({
    date,
    students,
  });

  const [confirmModal, setConfirmModal] = useState(false);

  const [unsavedModal, setUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [markAllModal, setMarkAllModal] = useState(false);

  const markAllPresent = () => {
    setData(
      "students",
      data.students.map((s: any) =>
        s.status === null ? { ...s, status: "present" } : s,
      ),
    );
  };

  const initialStudentsRef = useRef<any[]>(
    JSON.parse(JSON.stringify(students)),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const isDirty =
      JSON.stringify(data.students) !==
      JSON.stringify(initialStudentsRef.current);

    setHasUnsavedChanges(isDirty);
  }, [data.students]);

  const updateStatus = (studentId: number, status: string) => {
    setData(
      "students",
      data.students.map((s: any) =>
        s.id === studentId ? { ...s, status } : s,
      ),
    );
  };

  const confirmIfUnsaved = (action: () => void) => {
    if (!hasUnsavedChanges) {
      action();
      return;
    }

    setPendingAction(() => action);
    setUnsavedModal(true);
  };

  const submit = () => {
    post(`/admin/classes/${schoolClass.id}/attendance`);
  };

  const hasUnmarked = data.students.some((s: any) => s.status === null);

  const clearAttendance = () => {
    setData(
      "students",
      data.students.map((s: any) => ({
        ...s,
        status: null,
      })),
    );
  };

  const handleDateChange = (newDate: string) => {
    confirmIfUnsaved(() => {
      router.get(
        `/admin/classes/${schoolClass.id}/attendance`,
        { date: newDate },
        { preserveState: false, preserveScroll: true },
      );
    });
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const totalStudents = data.students.length;

  const markedCount = data.students.filter(
    (s: any) => s.status !== null,
  ).length;

  return (
    <>
      <Head title="Class Attendance" />
      <ConfirmActionModal
        show={confirmModal}
        title="Save Attendance"
        message={
          hasUnmarked
            ? "Some students have no attendance status selected. Continue?"
            : `You are about to save attendance for ${schoolClass.subject.name} on ${data.date}.`
        }
        icon="ri-calendar-check-line"
        iconColor="text-primary"
        confirmText="Yes, Save Attendance"
        confirmButtonClass="btn-primary"
        onConfirm={() => {
          submit();
          setConfirmModal(false);
          setHasUnsavedChanges(false);
          initialStudentsRef.current = JSON.parse(
            JSON.stringify(data.students),
          );
        }}
        onClose={() => setConfirmModal(false)}
      />

      <ConfirmActionModal
        show={unsavedModal}
        title="Unsaved Changes"
        message="You have unsaved attendance changes. If you continue, these changes will be lost."
        icon="ri-error-warning-line"
        iconColor="text-warning"
        confirmText="Discard Changes"
        confirmButtonClass="btn-warning"
        onConfirm={() => {
          if (pendingAction) pendingAction();
          setUnsavedModal(false);
          setPendingAction(null);
        }}
        onClose={() => {
          setUnsavedModal(false);
          setPendingAction(null);
        }}
      />

      <ConfirmActionModal
        show={markAllModal}
        title="Mark All Present"
        message="This will mark all unmarked students as Present. Existing attendance entries will not be changed."
        icon="ri-user-follow-line"
        iconColor="text-info"
        confirmText="Yes, Mark All Present"
        confirmButtonClass="btn-info"
        onConfirm={() => {
          markAllPresent();
          setMarkAllModal(false);
        }}
        onClose={() => setMarkAllModal(false)}
      />

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5>{schoolClass.subject.name} — Attendance</h5>
                      <small className="text-muted">
                        {schoolClass.section.grade_level} –{" "}
                        {schoolClass.section.name} | SY{" "}
                        {schoolClass.school_year.name}
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        onClick={() =>
                          confirmIfUnsaved(() => router.get("/admin/classes"))
                        }
                      >
                        ← Back to Classes
                      </Button>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body>
                  {/* Date Selector */}
                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={data.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col>
                      <small
                        className={
                          markedCount === totalStudents
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        Attendance marked: {markedCount} / {totalStudents}
                      </small>
                    </Col>
                  </Row>

                  <Table bordered hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th className="text-center">Present</th>
                        <th className="text-center">Absent</th>
                        <th className="text-center">Late</th>
                        <th className="text-center">Excused</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.students.map((student: any) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>

                          {["present", "absent", "late", "excused"].map(
                            (status) => (
                              <td key={status} className="text-center">
                                <Form.Label
                                  htmlFor={`attendance-${student.id}-${status}`}
                                  className="w-100 h-100 m-0 d-flex justify-content-center align-items-center"
                                  style={{ cursor: "pointer" }}
                                >
                                  <Form.Check
                                    id={`attendance-${student.id}-${status}`}
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    checked={student.status === status}
                                    onChange={() =>
                                      updateStatus(student.id, status)
                                    }
                                    disabled={!canMarkAttendance}
                                  />
                                </Form.Label>
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {canMarkAttendance && (
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="info"
                        onClick={() => setMarkAllModal(true)}
                      >
                        Mark All Present
                      </Button>

                      <Button
                        variant="light"
                        onClick={clearAttendance}
                        disabled={processing}
                      >
                        Clear Attendance
                      </Button>

                      <Button
                        variant="primary"
                        onClick={() => setConfirmModal(true)}
                        disabled={processing}
                      >
                        Save Attendance
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

ClassAttendance.layout = (page: any) => <Layout children={page} />;
export default ClassAttendance;
