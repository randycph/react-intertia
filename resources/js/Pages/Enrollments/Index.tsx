import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { Head, usePage, router } from "@inertiajs/react";
import Select from "react-select";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";

type SchoolYear = {
  id: number;
  name: string;
};

type Student = {
  id: number;
  student_no: string;
  first_name: string;
  last_name: string;
};

type Section = {
  id: number;
  grade_level: number;
  name: string;
};

type Enrollment = {
  id: number;
  status: string;
  student: Student;
  section: Section;
  school_year: SchoolYear;
};

interface EnrollmentPageProps {
  schoolYear: SchoolYear;
  students: Student[];
  sections: Section[];
  enrollments: Enrollment[];
}

const EnrollmentIndex = () => {
  const { schoolYear, students, sections, enrollments } =
    usePage<PageProps<EnrollmentPageProps>>().props;

  const [modal, setModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<Enrollment[]>(enrollments);
    
  useEffect(() => {
    setEnrollmentData(enrollments);
  }, [enrollments]);

  const toggle = () => {
    setModal(!modal);
    setSelectedEnrollment(null);
  };

  // ENROLL FORM
  const validation: any = useFormik({
    initialValues: {
      student_id: "",
      section_id: "",
    },
    validationSchema: Yup.object({
      student_id: Yup.number().required(),
      section_id: Yup.number().required(),
    }),
    onSubmit: (values) => {
      router.post("/admin/enrollments", values, {
        onSuccess: () => {
          validation.resetForm();
          toggle();
        },
      });
    },
  });

  // TRANSFER FORM
  const transferForm: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      new_section_id: "",
    },
    validationSchema: Yup.object({
      new_section_id: Yup.number().required(),
    }),
    onSubmit: (values) => {
      if (!selectedEnrollment) return;

      router.post(
        `/admin/enrollments/${selectedEnrollment.id}/transfer`,
        values,
        {
          onSuccess: () => {
            transferForm.resetForm();
            setTransferModal(false);
          },
        }
      );
    },
  });

  const handleEnrollmentsClicks = () => {
    setEnrollment(null);
    toggle();
  };

  const columns = useMemo(
    () => [
      {
        header: "Student No",
        cell: (cellProps: any) =>
          cellProps.row.original.student.student_no,
      },
      {
        header: "Student Name",
        cell: (cellProps: any) => {
          const s = cellProps.row.original.student;
          return `${s.last_name}, ${s.first_name}`;
        },
      },
      {
        header: "Section",
        cell: (cellProps: any) => {
          const s = cellProps.row.original.section;
          return `Grade ${s.grade_level} - ${s.name}`;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          const status = cellProps.getValue();
          return status === "enrolled" ? (
            <span className="badge bg-info-subtle text-info">
              Enrolled
            </span>
          ) : status === "transferred" ? (
            <span className="badge bg-warning-subtle text-warning">
              Transferred
            </span>
          ) : status === "dropped" ? (
            <span className="badge bg-danger-subtle text-danger">
              Dropped
            </span>
          ) : (
            <span className="badge bg-success-subtle text-success">
              Completed
            </span>
          );
        },
      },
      {
        header: "Actions",
        cell: (cellProps: any) => {
          const enrollment = cellProps.row.original;

          return (
            <Dropdown className="dropup-center">
              <Dropdown.Toggle
                as="button"
                className="btn btn-soft-secondary btn-sm arrow-none"
              >
                <i className="ri-more-fill" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {enrollment.status === "enrolled" && (
                  <>
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setTransferModal(true);
                      }}
                    >
                      <i className="ri-exchange-line me-2" />
                      Transfer
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        router.post(
                          `/admin/enrollments/${enrollment.id}/drop`
                        )
                      }
                    >
                      <i className="ri-user-unfollow-line me-2" />
                      Drop
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Enrollment | HS Admin" />

      {/* ENROLL MODAL */}
      <Modal show={modal} onHide={toggle} centered size="lg">
        <Modal.Header closeButton>
          <h5>Enroll Student</h5>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
          }}
        >
          <Modal.Body>
            <Row className="g-3">
              <Col lg={12}>
                <Form.Label>School Year</Form.Label>
                <Form.Control value={schoolYear.name} disabled />
              </Col>

              <Col lg={6}>
                <Form.Label>Student</Form.Label>
                <Select
                  options={students.map((s) => ({
                    value: s.id,
                    label: `${s.student_no} - ${s.last_name}, ${s.first_name}`,
                  }))}
                  onChange={(opt: any) =>
                    validation.setFieldValue("student_id", opt.value)
                  }
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Section</Form.Label>
                <Select
                  options={sections.map((s) => ({
                    value: s.id,
                    label: `Grade ${s.grade_level} - ${s.name}`,
                  }))}
                  onChange={(opt: any) =>
                    validation.setFieldValue("section_id", opt.value)
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={toggle}
            >
              Close
            </button>
            <button type="submit" className="btn btn-success">
              Enroll
            </button>
          </div>
        </Form>
      </Modal>

      {/* TRANSFER MODAL */}
      <Modal
        show={transferModal}
        onHide={() => setTransferModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <h5>Transfer Student</h5>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            transferForm.handleSubmit();
          }}
        >
          <Modal.Body>
            <Row className="g-3">
              <Col lg={12}>
                <Form.Label>New Section</Form.Label>
                <Select
                  options={sections.map((s) => ({
                    value: s.id,
                    label: `Grade ${s.grade_level} - ${s.name}`,
                  }))}
                  onChange={(opt: any) =>
                    transferForm.setFieldValue(
                      "new_section_id",
                      opt.value
                    )
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setTransferModal(false)}
            >
              Close
            </button>
            <button type="submit" className="btn btn-warning">
              Transfer
            </button>
          </div>
        </Form>
      </Modal>

      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">
                      Enrollment ({schoolYear.name})
                    </h5>
                    <button
                      className="btn btn-primary"
                      onClick={toggle}
                    >
                      <i className="ri-add-line" /> Enroll Student
                    </button>
                  </div>
                </Card.Header>
                  <Card.Body className="pt-0">
                  {enrollmentData && enrollmentData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={enrollmentData || []}
                      isGlobalFilter={true}
                      customPageSize={10}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0 table table-hover"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleEnrollmentsClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for enrollment or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-calendar-line fs-1 mb-3 d-block"></i>
                      <h5>No enrollments found</h5>
                      <p>Create your first enrollment to get started.</p>
                    </div>
                  )}
                  <ToastContainer closeButton={false} limit={1} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

EnrollmentIndex.layout = (page: any) => <Layout children={page} />;
export default EnrollmentIndex;
