package com.example.demo.dto;

public class OptionsStatsResponse {
    private long totalOptions;
    private long totalVotes;
    private OptionResponse mostPopularOption;
    private double averageVotes;

    public OptionsStatsResponse() {}

    public OptionsStatsResponse(long totalOptions, long totalVotes, OptionResponse mostPopularOption, double averageVotes) {
        this.totalOptions = totalOptions;
        this.totalVotes = totalVotes;
        this.mostPopularOption = mostPopularOption;
        this.averageVotes = averageVotes;
    }

    public long getTotalOptions() {
        return totalOptions;
    }

    public void setTotalOptions(long totalOptions) {
        this.totalOptions = totalOptions;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public OptionResponse getMostPopularOption() {
        return mostPopularOption;
    }

    public void setMostPopularOption(OptionResponse mostPopularOption) {
        this.mostPopularOption = mostPopularOption;
    }

    public double getAverageVotes() {
        return averageVotes;
    }

    public void setAverageVotes(double averageVotes) {
        this.averageVotes = averageVotes;
    }
}
