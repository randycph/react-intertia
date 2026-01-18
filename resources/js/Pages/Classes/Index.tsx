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

type Section = {
  id: number;
  grade_level: number;
  name: string;
};

type Subject = {
  id: number;
  name: string;
};

type Teacher = {
  id: number;
  first_name: string;
  last_name: string;
};

type SchoolClass = {
  id: number;
  status: string;
  school_year: SchoolYear;
  section: Section;
  subject: Subject;
  teacher: Teacher;
};

interface ClassesPageProps {
  classes: SchoolClass[];
  schoolYear: SchoolYear | null;
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
}

const ClassesIndex = () => {
  const { classes, schoolYear, sections, subjects, teachers, errors } =
    usePage<PageProps<ClassesPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [classData, setClassData] = useState<SchoolClass[]>(classes || []);

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  useEffect(() => {
    setClassData(classes);
  }, [classes]);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setSchoolClass(null);
    } else {
      setModal(true);
      setSchoolClass(null);
    }
  }, [modal]);

  // Formik
  const validation: any = useFormik({
    enableReinitialize: true,
    initialValues: {
      school_year_id: schoolYear?.id || "",
      section_id: schoolClass?.section?.id || "",
      subject_id: schoolClass?.subject?.id || "",
      teacher_id: schoolClass?.teacher?.id || "",
      status: schoolClass?.status || "active",
    },
    validationSchema: Yup.object({
      school_year_id: Yup.number().required(),
      section_id: Yup.number().required("Section is required"),
      subject_id: Yup.number().required("Subject is required"),
      teacher_id: Yup.number().required("Teacher is required"),
      status: Yup.string().required(),
    }),
    onSubmit: (values) => {
      if (isEdit && schoolClass) {
        router.put(`/admin/classes/${schoolClass.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle();
          },
        });
      } else {
        router.post("/admin/classes", values, {
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
  const handleDeleteClass = () => {
    if (schoolClass) {
      router.delete(`/admin/classes/${schoolClass.id}`);
      setDeleteModal(false);
    }
  };

  // Checkbox logic
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".classCheckbox");

    ele.forEach((el: any) => (el.checked = checkall.checked));
    deleteCheckbox();
  }, []);

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".classCheckbox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/classes/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");
    checkall.checked = false;

    setIsMultiDeleteButton(false);
    toast.clearWaitingQueue();
  };

  const handleEditClass = (data: SchoolClass) => {
    setSchoolClass(data);
    setIsEdit(true);

    validation.setValues({
      school_year_id: data.school_year.id,
      section_id: data.section.id,
      subject_id: data.subject.id,
      teacher_id: data.teacher.id,
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
            className="classCheckbox form-check-input"
            value={cellProps.row.original.id}
            onChange={deleteCheckbox}
          />
        ),
        id: "#",
      },
      {
        header: "School Year",
        enableColumnFilter: false,
        cell: (cellProps: any) =>
          cellProps.row.original.school_year?.name,
      },
      {
        header: "Section",
        cell: (cellProps: any) => {
          const s = cellProps.row.original.section;
          return `Grade ${s.grade_level} - ${s.name}`;
        },
      },
      {
        header: "Subject",
        cell: (cellProps: any) =>
          cellProps.row.original.subject?.name,
      },
      {
        header: "Teacher",
        cell: (cellProps: any) => {
          const t = cellProps.row.original.teacher;
          return `${t.last_name}, ${t.first_name}`;
        },
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
                href={`/admin/classes/${cellProps.row.original.id}/roster`}
              >
                <i className="ri-eye-fill me-2" />
                View Roster
              </Dropdown.Item>
              <Dropdown.Item
                href={`/admin/classes/${cellProps.row.original.id}/grades`}
              >
                <i className="ri-sticky-note-2-line me-2" />
                View Grades
              </Dropdown.Item>
              <Dropdown.Item
                href={`/admin/classes/${cellProps.row.original.id}/attendance`}
              >
                <i className="ri-calendar-check-fill me-2" />
                View Attendance
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleEditClass(cellProps.row.original)}
              >
                <i className="ri-pencil-fill me-2" /> Edit
              </Dropdown.Item>

              {cellProps.row.original.status === "inactive" && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      setSchoolClass(cellProps.row.original);
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
      <Head title="Classes | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteClass}
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
          <h5>{isEdit ? "Edit Class" : "Add Class"}</h5>
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
                <Form.Control
                  value={schoolYear?.name || ""}
                  disabled
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Section</Form.Label>
                <Select
                  value={
                    validation.values.section_id
                      ? {
                          value: validation.values.section_id,
                          label: (() => {
                            const s = sections.find(
                              (x) =>
                                x.id === validation.values.section_id
                            );
                            return s
                              ? `Grade ${s.grade_level} - ${s.name}`
                              : "";
                          })(),
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("section_id", opt.value)
                  }
                  options={sections.map((s) => ({
                    value: s.id,
                    label: `Grade ${s.grade_level} - ${s.name}`,
                  }))}
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Subject</Form.Label>
                <Select
                  value={
                    validation.values.subject_id
                      ? {
                          value: validation.values.subject_id,
                          label: subjects.find(
                            (s) =>
                              s.id === validation.values.subject_id
                          )?.name,
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("subject_id", opt.value)
                  }
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Col>

              <Col lg={6}>
                <Form.Label>Teacher</Form.Label>
                <Select
                  value={
                    validation.values.teacher_id
                      ? {
                          value: validation.values.teacher_id,
                          label: (() => {
                            const t = teachers.find(
                              (x) =>
                                x.id === validation.values.teacher_id
                            );
                            return t
                              ? `${t.last_name}, ${t.first_name}`
                              : "";
                          })(),
                        }
                      : null
                  }
                  onChange={(opt: any) =>
                    validation.setFieldValue("teacher_id", opt.value)
                  }
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: `${t.last_name}, ${t.first_name}`,
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
                      Classes
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
                          Create Class
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
                  {classData && classData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={classData}
                      isGlobalFilter
                      customPageSize={10}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      SearchPlaceholder="Search for class..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-book-2-line fs-1 mb-3 d-block"></i>
                      <h5>No classes found</h5>
                      <p>Create your first class to get started.</p>
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

ClassesIndex.layout = (page: any) => <Layout children={page} />;
export default ClassesIndex;
