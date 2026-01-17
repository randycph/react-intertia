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

type Subject = {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
};

interface SubjectsPageProps {
  subjects: Subject[];
}

const SubjectsIndex = () => {
  const { subjects, errors } =
    usePage<PageProps<SubjectsPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjectData, setSubjectData] = useState<Subject[]>(subjects || []);

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  useEffect(() => {
    setSubjectData(subjects);
  }, [subjects]);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setSubject(null);
    } else {
      setModal(true);
      setSubject(null);
    }
  }, [modal]);

  // Formik
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: subject?.code || "",
      name: subject?.name || "",
      description: subject?.description || "",
      status: subject?.status || "active",
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Code is required"),
      name: Yup.string().required("Name is required"),
      status: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (isEdit && subject) {
        router.put(`/admin/subjects/${subject.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle();
          },
        });
      } else {
        router.post("/admin/subjects", values, {
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
  const handleDeleteSubject = () => {
    if (subject) {
      router.delete(`/admin/subjects/${subject.id}`);
      setDeleteModal(false);
    }
  };

  // Checkbox logic
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".subjectCheckbox");

    ele.forEach((el: any) => (el.checked = checkall.checked));
    deleteCheckbox();
  }, []);

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".subjectCheckbox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/subjects/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");
    checkall.checked = false;

    setIsMultiDeleteButton(false);
    toast.clearWaitingQueue();
  };

  const handleEditSubject = (data: Subject) => {
    setSubject(data);
    setIsEdit(true);

    validation.setValues({
      code: data.code,
      name: data.name,
      description: data.description || "",
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
            className="subjectCheckbox form-check-input"
            value={cellProps.row.original.id}
            onChange={deleteCheckbox}
          />
        ),
        id: "#",
      },
      {
        header: "Code",
        accessorKey: "code",
        enableColumnFilter: false,
      },
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
        cell: (cellProps: any) =>
          cellProps.getValue() || (
            <span className="text-muted">—</span>
          ),
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) =>
          cellProps.getValue() === "active" ? (
            <span className="badge bg-info-subtle text-info">
              Active
            </span>
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
                onClick={() => handleEditSubject(cellProps.row.original)}
              >
                <i className="ri-pencil-fill me-2" /> Edit
              </Dropdown.Item>

              {cellProps.row.original.status === "inactive" && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      setSubject(cellProps.row.original);
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
      <Head title="Subjects | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteSubject}
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
          <h5>{isEdit ? "Edit Subject" : "Add Subject"}</h5>
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
                <Form.Label>Code</Form.Label>
                <Form.Control
                  name="code"
                  onChange={validation.handleChange}
                  value={validation.values.code}
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
              <Col lg={12}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  onChange={validation.handleChange}
                  value={validation.values.name}
                />
              </Col>
              <Col lg={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  onChange={validation.handleChange}
                  value={validation.values.description}
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
                    <h5 className="card-title mb-0 flex-grow-1">
                      Subjects
                    </h5>
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
                          Create Subject
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
                  {subjectData && subjectData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={subjectData}
                      isGlobalFilter
                      customPageSize={10}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      SearchPlaceholder="Search for subject..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-book-mark-line fs-1 mb-3 d-block"></i>
                      <h5>No subjects found</h5>
                      <p>Create your first subject to get started.</p>
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

SubjectsIndex.layout = (page: any) => <Layout children={page} />;
export default SubjectsIndex;
