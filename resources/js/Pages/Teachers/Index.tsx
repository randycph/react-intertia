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
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";
import "react-toastify/dist/ReactToastify.css";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";

type Teacher = {
  id: number;
  employee_no: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: string;
  email?: string;
  status: string;
  created_at: string;
};

interface TeachersPageProps {
  teachers: Teacher[];
}

const TeachersIndex = () => {
  const { teachers, errors } =
    usePage<PageProps<TeachersPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher[]>(teachers || []);

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  useEffect(() => {
    setTeacherData(teachers);
  }, [teachers]);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setTeacher(null);
    } else {
      setModal(true);
      setTeacher(null);
    }
  }, [modal]);

  // Formik
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      employee_no: teacher?.employee_no || "",
      first_name: teacher?.first_name || "",
      middle_name: teacher?.middle_name || "",
      last_name: teacher?.last_name || "",
      gender: teacher?.gender || "",
      email: teacher?.email || "",
      status: teacher?.status || "active",
    },
    validationSchema: Yup.object({
      employee_no: Yup.string().required("Employee No is required"),
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      email: Yup.string().email().nullable(),
      status: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (isEdit && teacher) {
        router.put(`/admin/teachers/${teacher.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle();
          },
        });
      } else {
        router.post("/admin/teachers", values, {
          onSuccess: () => {
            validation.resetForm();
            toggle();
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

  // Delete single
  const handleDeleteTeacher = () => {
    if (teacher) {
      router.delete(`/admin/teachers/${teacher.id}`);
      setDeleteModal(false);
    }
  };

  // Checkbox logic
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".teacherCheckbox");

    ele.forEach((el: any) => (el.checked = checkall.checked));
    deleteCheckbox();
  }, []);

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".teacherCheckbox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/teachers/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");
    checkall.checked = false;

    setIsMultiDeleteButton(false);
    toast.clearWaitingQueue();
  };

  const handleEditTeacher = (data: Teacher) => {
    setTeacher(data);
    setIsEdit(true);

    validation.setValues({
      employee_no: data.employee_no,
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      last_name: data.last_name,
      gender: data.gender || "",
      email: data.email || "",
      status: data.status,
    });

    setModal(true);
  };

  const columns = useMemo(
    () => [
      {
        header: (
          <Form.Check.Input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={checkedAll}
          />
        ),
        cell: (cellProps: any) => (
          <Form.Check.Input
            type="checkbox"
            className="teacherCheckbox form-check-input"
            value={cellProps.row.original.id}
            onChange={deleteCheckbox}
          />
        ),
        id: "#",
      },
      {
        header: "Employee No",
        accessorKey: "employee_no",
        enableColumnFilter: false,
      },
      {
        header: "Name",
        cell: (cellProps: any) => {
          const t = cellProps.row.original;
          return `${t.last_name}, ${t.first_name} ${t.middle_name ?? ""}`;
        },
      },
      {
        header: "Gender",
        accessorKey: "gender",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          const gender = cellProps.getValue();
          return gender
            ? gender.charAt(0).toUpperCase() + gender.slice(1)
            : "—";
        },
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
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
                onClick={() => handleEditTeacher(cellProps.row.original)}
              >
                <i className="ri-pencil-fill me-2" /> Edit
              </Dropdown.Item>

              {cellProps.row.original.status === "inactive" && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      setTeacher(cellProps.row.original);
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

  return (
    <React.Fragment>
      <Head title="Teachers | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteTeacher}
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
          <h5>{isEdit ? "Edit Teacher" : "Add Teacher"}</h5>
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
                <Form.Label>Employee No</Form.Label>
                <Form.Control
                  name="employee_no"
                  onChange={validation.handleChange}
                  value={validation.values.employee_no}
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
                    validation.setFieldValue("status", opt.value)
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
                  value={
                    validation.values.gender
                      ? {
                          value: validation.values.gender,
                          label:
                            validation.values.gender === "male"
                              ? "Male"
                              : "Female",
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("gender", opt.value)
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
                    <h5 className="card-title mb-0 flex-grow-1">Teachers</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary add-btn"
                          onClick={() => {
                            setIsEdit(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom"></i>{" "}
                          Create Teacher
                        </button>
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
                  {teacherData && teacherData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={teacherData}
                      isGlobalFilter
                      customPageSize={10}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      SearchPlaceholder="Search for teacher..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-user-3-line fs-1 mb-3 d-block"></i>
                      <h5>No teachers found</h5>
                      <p>Create your first teacher to get started.</p>
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

TeachersIndex.layout = (page: any) => <Layout children={page} />;
export default TeachersIndex;
