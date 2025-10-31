import React, { useEffect, useState } from "react";
import AllMoviesList, { ScreeningsInfo } from "../components/AllMoviesList";
import useFetch from "../hook/useFetch";
import FilterDropdown from "../components/filter/FilterDropdown";
import "./PagesStyle/allmoviesPages.scss";
import FilterBtn from "../components/filter/FilterBtn";
import { Col, Container, Row } from "react-bootstrap";
import { formatDate, getLimitedSortedDates } from "../utils/date";

interface SelectedFilter {
  date: string | null;
  auditorium: string | null;
  age: string | boolean;
}

export default function AllMoviesPage() {
  const [filteredData, setFilteredData] = useState<ScreeningsInfo[] | null>(
    null
  );
  const [filterOptions, setFilterOptions] = useState<SelectedFilter>({
    date: null,
    auditorium: null,
    age: false,
  });
  const { data, isLoading, error } = useFetch<ScreeningsInfo[]>(
    "/api/screeningsInfo"
  );

  const auditoriumOptions = [
    { label: "Neo Lilla", value: "Neo Lilla" },
    { label: "Neo Stora", value: "Neo Stora" },
  ];

  // Filter out dates that have already passed
  const now = new Date();
  const filteredDates =
    data?.filter((d) => {
      const date = new Date(d.startTime);
      return date >= now;
    }) ?? [];

  // gets raw dates removes iso after T
  const rawDates = filteredDates
    ? filteredDates.map((d) => d.startTime.split("T")[0])
    : [];
  // sets a limit of 7 days and sort them.
  const limitedDays = getLimitedSortedDates(rawDates);
  // formating dates so we get weekday before
  const formattedDays = limitedDays.map((d) => formatDate(d));

  // labe is what user sees, and value is whats beeing filtered with
  const dateOptions = limitedDays.map((d) => ({
    label: formatDate(d),
    value: d,
  }));

  const handleOnClickDate = (date: string) => {
    setFilterOptions((prev) => ({ ...prev, date }));
  };
  const handleOnClickAuditorium = (auditorium: string) => {
    setFilterOptions((prev) => ({ ...prev, auditorium }));
  };
  const handleOnClickAge = () => {
    setFilterOptions((prev) => ({ ...prev, age: !prev.age }));
  };

  // useEffect if data or filterOptions change, (if data and auditorium is false show all)
  useEffect(() => {
    if (!data) return;

    const filtered = filteredDates.filter((screening) => {
      return (
        (!filterOptions.date ||
          screening.startTime.split("T")[0] === filterOptions.date) &&
        (!filterOptions.auditorium ||
          screening.auditoriumName === filterOptions.auditorium) &&
        (!filterOptions.age || Number(screening.info.ageLimit) < 15)
      );
    });

    setFilteredData(filtered);
  }, [data, filterOptions]);

  return (
    <Container fluid className=" container-lg">
      <main className="all-movies-container">
        <Row className="text-container">
          <Row>
            <Col xs={12} md={4} lg={4}>
              <h1 className="all-movies-header">På bio just nu</h1>
            </Col>
          </Row>
          <Col>
            <p className="choose-text">
              Välj mellan våra två biografer och se vilka filmer som går
            </p>
          </Col>
        </Row>
        <Row className="mx-sm-5">
          <Col xs="4" md="auto">
            <FilterDropdown
              label="Välj ett datum"
              onClick={handleOnClickDate}
              options={dateOptions}
            />
          </Col>
          <Col xs="4" md="auto">
            <FilterDropdown
              label="Välj en salong"
              onClick={handleOnClickAuditorium}
              options={auditoriumOptions}
            />
          </Col>
          <Col xs="3" md="auto" className="d-flex align-items-end">
            <FilterBtn
              btnName={filterOptions.age ? ["Över 15"] : ["Under 15"]}
              onClick={handleOnClickAge}
            />
          </Col>
        </Row>
        {error && <p>Något gick fel: {error}</p>}
        {isLoading && <p>Loading...</p>}
        {data && <AllMoviesList movies={filteredData ?? data} />}
      </main>
    </Container>
  );
}
