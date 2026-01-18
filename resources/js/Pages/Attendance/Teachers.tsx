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

const TeacherAttendance = () => {
  const { teachers, date, schoolYear, canMarkAttendance } =
    usePage().props as any;

  const { data, setData, post, processing } = useForm({
    date,
    teachers,
  });

  const [confirmModal, setConfirmModal] = useState(false);

  const [unsavedModal, setUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [markAllModal, setMarkAllModal] = useState(false);

  const markAllPresent = () => {
    setData(
      "teachers",
      data.teachers.map((s: any) =>
        s.status === null ? { ...s, status: "present" } : s,
      ),
    );
  };

  const initialTeachersRef = useRef<any[]>(
    JSON.parse(JSON.stringify(teachers)),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const isDirty =
      JSON.stringify(data.teachers) !==
      JSON.stringify(initialTeachersRef.current);

    setHasUnsavedChanges(isDirty);
  }, [data.teachers]);

  const updateStatus = (teacherId: number, status: string) => {
    setData(
      "teachers",
      data.teachers.map((s: any) =>
        s.id === teacherId ? { ...s, status } : s,
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
    post(`/admin/teacher-attendance`);
  };

  const hasUnmarked = data.teachers.some((s: any) => s.status === null);

  const clearAttendance = () => {
    setData(
      "teachers",
      data.teachers.map((s: any) => ({
        ...s,
        status: null,
      })),
    );
  };

  const handleDateChange = (newDate: string) => {
    confirmIfUnsaved(() => {
      router.get(
        `/admin/teacher-attendance`,
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

  const totalTeachers = data.teachers.length;

  const markedCount = data.teachers.filter(
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
            ? "Some teachers have no attendance status selected. Continue?"
            : `You are about to save attendance for ${schoolYear.name} on ${data.date}.`
        }
        icon="ri-calendar-check-line"
        iconColor="text-primary"
        confirmText="Yes, Save Attendance"
        confirmButtonClass="btn-primary"
        onConfirm={() => {
          submit();
          setConfirmModal(false);
          setHasUnsavedChanges(false);
          initialTeachersRef.current = JSON.parse(
            JSON.stringify(data.teachers),
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
                      <h5>Teacher Attendance</h5>
                      <small className="text-muted">
                        {schoolYear.name} • Date: {data.date}
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      {/* <Button
                        variant="light"
                        onClick={() =>
                          confirmIfUnsaved(() => router.get("/admin/classes"))
                        }
                      >
                        ← Back to Classes
                      </Button> */}
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
                          markedCount === totalTeachers
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        Attendance marked: {markedCount} / {totalTeachers}
                      </small>
                    </Col>
                  </Row>

                  <Table bordered hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Teacher</th>
                        <th className="text-center">Present</th>
                        <th className="text-center">Absent</th>
                        <th className="text-center">Late</th>
                        <th className="text-center">Excused</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.teachers.map((teacher: any) => (
                        <tr key={teacher.id}>
                          <td>{teacher.name}</td>

                          {["present", "absent", "late", "excused"].map(
                            (status) => (
                              <td key={status} className="text-center">
                                <Form.Label
                                  htmlFor={`attendance-${teacher.id}-${status}`}
                                  className="w-100 h-100 m-0 d-flex justify-content-center align-items-center"
                                  style={{ cursor: "pointer" }}
                                >
                                  <Form.Check
                                    id={`attendance-${teacher.id}-${status}`}
                                    type="radio"
                                    name={`attendance-${teacher.id}`}
                                    checked={teacher.status === status}
                                    onChange={() =>
                                      updateStatus(teacher.id, status)
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

TeacherAttendance.layout = (page: any) => <Layout children={page} />;
export default TeacherAttendance;
