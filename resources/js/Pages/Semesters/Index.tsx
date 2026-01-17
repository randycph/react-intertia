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

type Semester = {
  id: number;
  school_year_id: number;
  schoolYear?: { id: number; name: string };
  name: string;
  order: number;
  status: string;
  created_at: string;
};

type SchoolYear = {
  id: number;
  name: string;
};

interface SemestersPageProps {
  semesters: Semester[];
  schoolYears: SchoolYear[];
}

const SemestersIndex = () => {
  const { semesters, schoolYears, errors } = usePage<PageProps<SemestersPageProps>>().props;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [semester, setSemester] = useState<Semester | null>(null);
  const [semesterData, setSemesterData] = useState<Semester[]>(semesters);

  useEffect(() => {
    setSemesterData(semesters);
  }, [semesters]);

  // Delete Semesters
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setSemester(null);
    } else {
      setModal(true);
      setSemester(null);
    }
  }, [modal]);

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: semester?.id || "",
      name: semester?.name || "",
      status: semester?.status || "active",
      schoolYearId: semester?.school_year_id ?? null,
      order: semester?.order || 0,
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Please enter semester name"),
      status: Yup.string().required("Please select status"),
      schoolYearId: Yup.number()
        .required("Please select a school year")
        .typeError("Please select a school year"),
      order: Yup.number().required("Please enter order"),
    }),

    onSubmit: (values) => {
      if (isEdit && semester) {
        router.put(`/admin/semesters/${semester.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else {
        router.post("/admin/semesters", values, {
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
  const handleDeleteSemester = () => {
    if (semester) {
      router.delete(`/admin/semesters/${semester.id}`);
      setDeleteModal(false);
    }
  };

  const handleEditSemester = (semesterData: Semester & { schoolYear?: { id: number } }) => {
    setIsEdit(true);
    setSemester(semesterData);

    validation.setValues({
      id: semesterData.id,
      name: semesterData.name,
      status: semesterData.status,
      order: semesterData.order,
      school_year_id: semesterData.school_year_id,
    });

    setModal(true);
  };

  // Get Data

  useEffect(() => {
    setSemesterData(semesters);
  }, [semesters]);

  // Add Data
  const handleSemestersClicks = () => {
    setSemester(null);
    setIsEdit(false);
    toggle();
  };

  const handleActivateSemester = (semesterData: Semester) => {
    setSemester(semesterData);

    router.post(`/admin/semesters/${semesterData.id}/activate`, {}, {
      onSuccess: () => {
        //
      },
    });
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".semesterCheckBox");

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

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/semesters/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");

    setIsMultiDeleteButton(false);

    setTimeout(() => {
      toast.clearWaitingQueue();
    }, 3000);

    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".semesterCheckBox:checked");
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
          return (
            <Form.Check.Input
              type="checkbox"
              className="semesterCheckBox form-check-input"
              value={cellProps.row.original.id}
              onChange={() => deleteCheckbox()}
            />
          );
        },
        id: "#",
      },
      {
        header: "School Year",
        accessorKey: "school_year_id",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{
            schoolYears.find(
              (schoolYear: SchoolYear) => schoolYear.id === cellProps.getValue()
            )?.name
          }</>;
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Order",
        accessorKey: "order",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return (
            <div className="form-check form-switch form-switch-md" dir="ltr">
                <Form.Check.Input type="checkbox" onChange={() => handleActivateSemester(cellProps.row.original)} className="form-check-input" checked={cellProps.getValue() === "active"} />
            </div>
          );
        }
      },
      {
        header: "Actions",
        cell: (cellProps: any) => {
          return (
            <Dropdown>
              <Dropdown.Toggle
                as="a"
                className="btn btn-soft-secondary btn-sm arrow-none"
              >
                <i className="ri-more-fill align-middle"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <li>
                  <Dropdown.Item
                    className="edit-item-btn"
                    href="#showModal"
                    data-bs-toggle="modal"
                    onClick={() => handleEditSemester(cellProps.row.original)}
                  >
                    <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                    Edit
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item
                    className="remove-item-btn"
                    data-bs-toggle="modal"
                    href="#deleteOrder"
                    onClick={() => {
                      setSemester(cellProps.row.original);
                      setDeleteModal(true);
                    }}
                  >
                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                    Delete
                  </Dropdown.Item>
                </li>
              </Dropdown.Menu>
            </Dropdown>
          );
        },
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
      <Head title="Semesters | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteSemester}
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

      <Modal
        show={modal}
        onHide={toggle}
        centered
        size="lg"
        className="border-0"
        dialogClassName="zoomIn"
      >
        <Modal.Header className="p-3 bg-info-subtle" closeButton>
          <h5 className="modal-title">{!!isEdit ? "Edit Semester" : "Add Semester"}</h5>
        </Modal.Header>
        <Form
          className="tablelist-form"
          onSubmit={(e: any) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
        >
          <Modal.Body>
            <Row className="g-3">
              <Col lg={12}>
                <div>
                  <Form.Label>Semester Name</Form.Label>
                  <Form.Control
                    name="name"
                    isInvalid={!!validation.errors.name}
                    placeholder="Enter semester name"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.name}
                  />
                  {validation.touched.name && validation.errors.name ? (
                    <Form.Control.Feedback type="invalid">
                      {validation.errors.name}
                    </Form.Control.Feedback>
                  ) : null}
                </div>
              </Col>
              <Col lg={6}>
                <Form.Label htmlFor="school-year-id" className="form-label">
                  School Year
                </Form.Label>
                <Select
                  value={
                    validation.values.schoolYearId
                      ? {
                          value: validation.values.schoolYearId,
                          label: schoolYears.find(
                            (y: SchoolYear) => y.id === validation.values.schoolYearId
                          )?.name,
                        }
                      : null
                  }
                  onChange={(option: any) => {
                    validation.setFieldValue("schoolYearId", option.value);
                    validation.setFieldTouched("schoolYearId", true);
                  }}
                  options={schoolYears.map((y: SchoolYear) => ({
                    value: y.id,
                    label: y.name,
                  }))}
                />
                {validation.touched.schoolYearId && validation.errors.schoolYearId && (
                  <div className="invalid-feedback d-block">
                    {validation.errors.schoolYearId}
                  </div>
                )}
              </Col>
              <Col lg={6}>
                <Form.Label htmlFor="order" className="form-label">
                  Order
                </Form.Label>
                <Form.Control
                  type="number"
                  id="order"
                  value={validation.values.order}
                  onChange={(e) => validation.setFieldValue("order", e.target.value)}
                  isInvalid={!!validation.errors.order && validation.touched.order}
                />
                {validation.touched.order && validation.errors.order ? (
                  <Form.Control.Feedback type="invalid">
                    {validation.errors.order}
                  </Form.Control.Feedback>
                ) : null}
              </Col>
            </Row>
          </Modal.Body>
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <button onClick={toggle} type="button" className="btn btn-light">
                Close
              </button>
              <button type="submit" className="btn btn-success" id="add-btn">
                {!!isEdit ? "Update" : "Add Semester"}
              </button>
            </div>
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
                    <h5 className="card-title mb-0 flex-grow-1">Semesters</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary add-btn"
                          onClick={() => {
                            setIsEdit(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom"></i> Create
                          Semester
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
                  {semesterData && semesterData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={semesterData || []}
                      isGlobalFilter={true}
                      customPageSize={8}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0 table table-hover"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleSemestersClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for semester or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-calendar-line fs-1 mb-3 d-block"></i>
                      <h5>No semesters found</h5>
                      <p>Create your first semester to get started.</p>
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

SemestersIndex.layout = (page: any) => <Layout children={page} />;
export default SemestersIndex;
