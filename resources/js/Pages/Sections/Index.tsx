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

type SchoolYear = {
  id: number;
  name: string;
};

type Teacher = {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
};

type Section = {
  id: number;
  grade_level: number;
  name: string;
  status: string;
  school_year: SchoolYear;
  adviser?: Teacher;
};

interface SectionsPageProps {
  sections: Section[];
  schoolYears: SchoolYear[];
  teachers: Teacher[];
}

const SectionsIndex = () => {
  const { sections, schoolYears, teachers, errors } =
    usePage<PageProps<SectionsPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [sectionData, setSectionData] = useState<Section[]>(sections || []);

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  useEffect(() => {
    setSectionData(sections);
  }, [sections]);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setSection(null);
    } else {
      setModal(true);
      setSection(null);
    }
  }, [modal]);

  // Formik
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      school_year_id: section?.school_year?.id || "",
      grade_level: section?.grade_level || "",
      name: section?.name || "",
      adviser_id: section?.adviser?.id || "",
      status: section?.status || "active",
    },
    validationSchema: Yup.object({
      school_year_id: Yup.number().required("School year is required"),
      grade_level: Yup.number().required("Grade level is required"),
      name: Yup.string().required("Section name is required"),
      status: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (isEdit && section) {
        router.put(`/admin/sections/${section.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle();
          },
        });
      } else {
        router.post("/admin/sections", values, {
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
  const handleDeleteSection = () => {
    if (section) {
      router.delete(`/admin/sections/${section.id}`);
      setDeleteModal(false);
    }
  };

  // Checkbox logic
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".sectionCheckbox");

    ele.forEach((el: any) => (el.checked = checkall.checked));
    deleteCheckbox();
  }, []);

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".sectionCheckbox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/sections/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");
    checkall.checked = false;

    setIsMultiDeleteButton(false);
    toast.clearWaitingQueue();
  };

  const handleEditSection = (data: Section) => {
    setSection(data);
    setIsEdit(true);

    validation.setValues({
      school_year_id: data.school_year.id,
      grade_level: data.grade_level,
      name: data.name,
      adviser_id: data.adviser?.id || "",
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
            className="sectionCheckbox form-check-input"
            value={cellProps.row.original.id}
            onChange={deleteCheckbox}
          />
        ),
        id: "#",
      },
      {
        header: "School Year",
        cell: (cellProps: any) =>
          cellProps.row.original.school_year?.name,
      },
      {
        header: "Grade",
        enableColumnFilter: false,
        accessorKey: "grade_level",
      },
      {
        header: "Section",
        enableColumnFilter: false,
        accessorKey: "name",
      },
      {
        header: "Adviser",
        cell: (cellProps: any) => {
          const adviser = cellProps.row.original.adviser;
          return adviser
            ? `${adviser.last_name}, ${adviser.first_name}`
            : "—";
        },
      },
      {
        header: "Status",
        enableColumnFilter: false,
        accessorKey: "status",
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
                onClick={() => handleEditSection(cellProps.row.original)}
              >
                <i className="ri-pencil-fill me-2" /> Edit
              </Dropdown.Item>

              {cellProps.row.original.status === "inactive" && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      setSection(cellProps.row.original);
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
      <Head title="Sections | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteSection}
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
          <h5>{isEdit ? "Edit Section" : "Add Section"}</h5>
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
                <Form.Label>School Year</Form.Label>
                <Select
                  value={
                    validation.values.school_year_id
                      ? {
                          value: validation.values.school_year_id,
                          label: schoolYears.find(
                            (sy) =>
                              sy.id === validation.values.school_year_id
                          )?.name,
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("school_year_id", opt.value)
                  }
                  options={schoolYears.map((sy) => ({
                    value: sy.id,
                    label: sy.name,
                  }))}
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
                <Form.Label>Grade Level</Form.Label>
                <Form.Control
                  type="number"
                  name="grade_level"
                  onChange={validation.handleChange}
                  value={validation.values.grade_level}
                />
              </Col>
              <Col lg={4}>
                <Form.Label>Section Name</Form.Label>
                <Form.Control
                  name="name"
                  onChange={validation.handleChange}
                  value={validation.values.name}
                />
              </Col>
              <Col lg={4}>
                <Form.Label>Adviser</Form.Label>
                <Select
                  value={
                    validation.values.adviser_id
                      ? {
                          value: validation.values.adviser_id,
                          label: teachers.find(
                            (t) =>
                              t.id === validation.values.adviser_id
                          )
                            ? `${teachers.find(
                                (t) =>
                                  t.id === validation.values.adviser_id
                              )?.last_name}, ${
                                teachers.find(
                                  (t) =>
                                    t.id === validation.values.adviser_id
                                )?.first_name
                              }`
                            : "",
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("adviser_id", opt.value)
                  }
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: `${t.last_name}, ${t.first_name}`,
                  }))}
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
                      Sections
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
                          Create Section
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
                  {sectionData && sectionData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={sectionData}
                      isGlobalFilter
                      customPageSize={10}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      SearchPlaceholder="Search for section..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-group-line fs-1 mb-3 d-block"></i>
                      <h5>No sections found</h5>
                      <p>Create your first section to get started.</p>
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

SectionsIndex.layout = (page: any) => <Layout children={page} />;
export default SectionsIndex;
