import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { Head, Link, usePage, router } from "@inertiajs/react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { isEmpty } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";
import "react-toastify/dist/ReactToastify.css";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";
import Loader from "../../Components/Common/Loader";

type Student = {
    id: number;
    student_no: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender?: string;
    email?: string;
    status: string;
    created_at: string;
};

interface StudentsPageProps {
    students: Student[];
}

const StudentsIndex = () => {
    const { students, errors } = usePage<PageProps<StudentsPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentData, setStudentData] = useState<Student[]>(students || []);

  useEffect(() => {
    setStudentData(students);
  }, [students]);
  // Delete Students
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setStudent(null);
    } else {
      setModal(true);
      setStudent(null);
    }
  }, [modal]);

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
        student_no: student?.student_no || "",
        first_name: student?.first_name || "",
        middle_name: student?.middle_name || "",
        last_name: student?.last_name || "",
        gender: student?.gender || "",
        email: student?.email || "",
        status: student?.status || "active",
    },
    validationSchema: Yup.object({
        student_no: Yup.string().required("Student No is required"),
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        email: Yup.string().email().nullable(),
        status: Yup.string().required(),
    }),

    onSubmit: (values) => {
      if (isEdit && student) {
        router.put(`/admin/students/${student.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else if (isChangePassword && student) {
        router.put(`/admin/students/change-password/${student.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else {
        router.post("/admin/students", values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      }
    },
  });

  useEffect(() => {
    if (errors) {
      validation.setErrors(errors as any);
    }
  }, [errors]);

  // Delete Data
  const handleDeleteStudent = () => {
    if (student) {
      router.delete(`/admin/students/${student.id}`);
      setDeleteModal(false);
    }
  };

  // Get Data
  useEffect(() => {
    setStudentData(students);
  }, [students]);



  // Add Data
  const handleStudentsClicks = () => {
    setStudent(null);
    setIsEdit(false);
    toggle();
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".studentCheckbox");

    if (checkall.checked) {
      ele.forEach((ele: any) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele: any) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

const handleEditStudent = (data: Student) => {
    setStudent(data);
    setIsEdit(true);

    validation.setValues({
        student_no: data.student_no,
        first_name: data.first_name,
        middle_name: data.middle_name || "",
        last_name: data.last_name,
        gender: data.gender || "",
        email: data.email || "",
        status: data.status,
    });

    setModal(true);
};

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/students/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");

    setIsMultiDeleteButton(false);

    setTimeout(() => {
      toast.clearWaitingQueue();
    }, 3000);

    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".studentCheckbox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

const columns = useMemo(
        () => [
            {
            header: (
                <Form.Check.Input
                    type="checkbox"
                    id="checkBoxAll"
                    className="form-check-input"
                    onClick={() => checkedAll()}
                />
            ),
            cell: (cellProps: any) => {
                const studentId = cellProps.row.original.id;

                return (
                <Form.Check.Input
                    type="checkbox"
                    className="studentCheckbox form-check-input"
                    value={studentId}
                    onChange={() => deleteCheckbox()}
                />
                );
            },
            id: "#",
            },
            { 
                header: "Student No", 
                accessorKey: "student_no",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return <>{cellProps.getValue()}</>;
                },
            },
            {
                header: "Name",
                cell: (cellProps: any) => {
                    const s = cellProps.row.original;
                    return `${s.last_name}, ${s.first_name} ${s.middle_name ?? ""}`;
                },
            },
            { 
                header: "Gender",
                accessorKey: "gender",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    const gender = cellProps.getValue();
                    return <>{gender.charAt(0).toUpperCase() + gender.slice(1)}</>;
                },
            },
            { 
                header: "Email", 
                accessorKey: "email",
                enableColumnFilter: false,
                cell: (cellProps: any) => {
                    return <>{cellProps.getValue()}</>;
                },
            },
            {
                header: "Status",
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cellProps: any) =>
                    cellProps.getValue() === "active" ? (
                        <span className="badge bg-info-subtle text-info">Active</span>
                    ) : (
                        <span className="badge bg-danger-subtle text-danger">
                            Inactive
                        </span>
                    ),
            },
            {
                header: "Actions",
                cell: (cellProps: any) => (
                    <Dropdown className="dropup-center">
                        <Dropdown.Toggle
                            as="button"
                            className="btn btn-soft-secondary btn-sm arrow-none mb-0"
                        >
                            <i className="ri-more-fill" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                onClick={() =>
                                    handleEditStudent(cellProps.row.original)
                                }
                            >
                                <i className="ri-pencil-fill me-2" /> Edit
                            </Dropdown.Item>
                            {cellProps.row.original.status === "inactive" && (
                                <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                        onClick={() => {
                                            setStudent(cellProps.row.original);
                                            setDeleteModal(true);
                                        }}
                                    >
                                        <i className="ri-delete-bin-fill me-2" />
                                        Delete
                                    </Dropdown.Item>
                                </>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                ),
            },
        ],
        [checkedAll]
    );

  const Status = (cell: any) => {
    return (
      <React.Fragment>
        {cell.getValue() === "inactive" ? (
          <span className="badge bg-danger-subtle  text-danger text-uppercase">
            {cell.getValue()}
          </span>
        ) : cell.getValue() === "active" ? (
          <span className="badge bg-info-subtle  text-info text-uppercase">
            {cell.getValue()}
          </span>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Head title="Students | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteStudent}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
      </Row>

        {/* Modal */}
        <Modal show={modal} onHide={toggle} centered size="lg">
            <Modal.Header closeButton>
                <h5>{isEdit ? "Edit Student" : "Add Student"}</h5>
            </Modal.Header>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit();
                }}
            >
                <Modal.Body>
                    <Row className="g-3">
                        <Col lg={6}>
                            <Form.Label>Student No</Form.Label>
                            <Form.Control
                                name="student_no"
                                onChange={validation.handleChange}
                                value={validation.values.student_no}
                            />
                        </Col>
                        <Col lg={6}>
                            <Form.Label>Status</Form.Label>
                            <Select
                                value={{
                                    value: validation.values.status,
                                    label:
                                        validation.values.status === "active"
                                            ? "Active"
                                            : "Inactive",
                                }}
                                onChange={(opt: any) =>
                                    validation.setFieldValue(
                                        "status",
                                        opt.value
                                    )
                                }
                                options={[
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                ]}
                            />
                        </Col>
                        <Col lg={4}>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                name="first_name"
                                onChange={validation.handleChange}
                                value={validation.values.first_name}
                            />
                        </Col>
                        <Col lg={4}>
                            <Form.Label>Middle Name</Form.Label>
                            <Form.Control
                                name="middle_name"
                                onChange={validation.handleChange}
                                value={validation.values.middle_name}
                            />
                        </Col>
                        <Col lg={4}>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                name="last_name"
                                onChange={validation.handleChange}
                                value={validation.values.last_name}
                            />
                        </Col>
                        <Col lg={6}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                name="email"
                                onChange={validation.handleChange}
                                value={validation.values.email}
                            />
                        </Col>
                        <Col lg={6}>
                            <Form.Label>Gender</Form.Label>
                            <Select
                                value={{
                                    value: validation.values.gender,
                                    label:
                                        validation.values.gender === "male"
                                            ? "Male"
                                            : "Female",
                                }}
                                onChange={(opt: any) =>
                                    validation.setFieldValue(
                                        "gender",
                                        opt.value
                                    )
                                }
                                options={[
                                    { value: "male", label: "Male" },
                                    { value: "female", label: "Female" },
                                ]}
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
                        {isEdit ? "Update" : "Add"}
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
                    <h5 className="card-title mb-0 flex-grow-1">Students</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary add-btn"
                          onClick={() => {
                            setIsEdit(false);
                            setIsChangePassword(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom"></i> Create
                          Student
                        </button>{" "}
                        {isMultiDeleteButton && (
                          <button
                            className="btn btn-soft-danger"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0">
                  {studentData && studentData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={studentData || []}
                      isGlobalFilter={true}
                      customPageSize={10}
                      divClass=" table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleStudentsClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for student or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-user-line fs-1 mb-3 d-block"></i>
                      <h5>No students found</h5>
                      <p>Create your first student to get started.</p>
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

StudentsIndex.layout = (page: any) => <Layout children={page} />;
export default StudentsIndex;